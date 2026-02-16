/**
 * ContentStructurer: 入力ドキュメントを PresentationPlan に変換する。
 * Python structurer.py からの移植。
 */

import { toJSONSchema } from 'zod';
import type { AudienceLevel, LecturerProfile, ParsedDocument, PresentationPlan, SlideContent } from '../schemas';
import { PresentationPlanSchema } from '../schemas';
import { AnthropicClient } from './anthropic';
import { buildSystemPrompt, REFINE_SYSTEM_PROMPT } from './prompts';
import { validateAndFix } from './validator';

/** Claude API tool_use 互換にするためのクリーンアップ */
function cleanSchemaForClaude(obj: unknown): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  const rec = obj as Record<string, unknown>;

  // Claude tool_use は additionalProperties を嫌うことがある
  delete rec['additionalProperties'];
  // $schema はトップレベル以外では不要
  delete rec['$schema'];
  // default 値を除去（Claude が default を使って空のデータを返す問題を回避）
  delete rec['default'];

  for (const v of Object.values(rec)) {
    if (v && typeof v === 'object') {
      if (Array.isArray(v)) {
        v.forEach(cleanSchemaForClaude);
      } else {
        cleanSchemaForClaude(v);
      }
    }
  }
}

/** PresentationPlan の tool_use 互換 JSON Schema を取得する */
export function getPresentationPlanJsonSchema(): Record<string, unknown> {
  // Zod 4 のネイティブ toJSONSchema を使用
  const raw = toJSONSchema(PresentationPlanSchema) as Record<string, unknown>;

  // Claude API 互換にクリーンアップ
  cleanSchemaForClaude(raw);

  // Claude API の tool_use は input_schema に "type" フィールド必須
  if (!raw['type']) {
    raw['type'] = 'object';
  }

  console.log('[Schema] Generated JSON Schema:', JSON.stringify(raw).substring(0, 1500));

  return raw;
}

const SOURCE_LABELS: Record<string, string> = {
  pdf: '論文',
  text: 'テキスト',
  docx: 'Word 文書',
  url: 'Web ページ',
};

function smartTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const front = Math.floor(maxChars * 0.6);
  const back = maxChars - front;
  return (
    text.substring(0, front) +
    '\n\n[... 中略（文字数制限のため省略） ...]\n\n' +
    text.substring(text.length - back)
  );
}

function buildUserContent(doc: ParsedDocument): string {
  const parts: string[] = [];

  const label = SOURCE_LABELS[doc.source_type] ?? 'コンテンツ';
  parts.push(`# ${label}情報\nタイトル: ${doc.title}`);

  if (doc.authors.length > 0) {
    parts.push(`著者: ${doc.authors.join(', ')}`);
  }
  if (doc.abstract) {
    parts.push(`\n## 概要\n${doc.abstract}`);
  }
  if (doc.figures.length > 0) {
    const figList = doc.figures
      .map(
        (f) =>
          `- ${f.figure_id || '(図)'}: ${f.caption} (image_ref: ${f.figure_id})`
      )
      .join('\n');
    parts.push(`\n## 利用可能な図表\n${figList}`);
  }

  let content = doc.full_markdown ?? '';
  if (content.length > 100_000) {
    content = smartTruncate(content, 100_000);
  }
  parts.push(`\n## 全文（Markdown）\n${content}`);

  return parts.join('\n');
}

/** Zod parse が失敗した場合に API レスポンスを PresentationPlan 形式に手動変換 */
function coercePlan(raw: Record<string, unknown>): PresentationPlan {
  const VALID_LAYOUTS = ['title', 'section_header', 'content', 'content_with_image', 'two_column', 'table', 'diagram', 'key_takeaway'];
  const VALID_AUDIENCES = ['pharmacy_undergrad', 'grad_student', 'researcher', 'general'];
  const VALID_DIAGRAM_TYPES = ['flowchart', 'comparison_table', 'sequence', 'timeline'];

  const rawSlides = Array.isArray(raw.slides) ? raw.slides : [];
  const slides: SlideContent[] = rawSlides.map((s: Record<string, unknown>, i: number) => {
    const layout = VALID_LAYOUTS.includes(s.layout_type as string)
      ? (s.layout_type as SlideContent['layout_type'])
      : 'content';

    const rawBullets = Array.isArray(s.bullets) ? s.bullets : [];
    const bullets = rawBullets.map((b: unknown) => {
      if (b && typeof b === 'object') {
        const bp = b as Record<string, unknown>;
        return {
          text: String(bp.text ?? ''),
          level: typeof bp.level === 'number' ? bp.level : 0,
          bold: !!bp.bold,
        };
      }
      return { text: String(b), level: 0, bold: false };
    });

    let table = null;
    if (s.table && typeof s.table === 'object') {
      const t = s.table as Record<string, unknown>;
      table = {
        headers: Array.isArray(t.headers) ? t.headers.map(String) : [],
        rows: Array.isArray(t.rows) ? t.rows.map((r: unknown) => Array.isArray(r) ? r.map(String) : []) : [],
        caption: String(t.caption ?? ''),
      };
    }

    let diagram = null;
    if (s.diagram && typeof s.diagram === 'object') {
      const d = s.diagram as Record<string, unknown>;
      diagram = {
        diagram_type: VALID_DIAGRAM_TYPES.includes(d.diagram_type as string)
          ? (d.diagram_type as 'flowchart' | 'comparison_table' | 'sequence' | 'timeline')
          : 'flowchart',
        mermaid_code: String(d.mermaid_code ?? ''),
        caption: String(d.caption ?? ''),
        fallback_description: String(d.fallback_description ?? ''),
      };
    }

    return {
      slide_number: typeof s.slide_number === 'number' ? s.slide_number : i + 1,
      layout_type: layout,
      title: String(s.title ?? ''),
      subtitle: String(s.subtitle ?? ''),
      bullets,
      notes: String(s.notes ?? ''),
      table,
      diagram,
      image_ref: s.image_ref != null ? String(s.image_ref) : null,
      image_prompt: String(s.image_prompt ?? ''),
      key_message: String(s.key_message ?? ''),
    };
  });

  return {
    paper_title: String(raw.paper_title ?? ''),
    lecture_title: String(raw.lecture_title ?? ''),
    total_slides: slides.length,
    audience_level: VALID_AUDIENCES.includes(raw.audience_level as string)
      ? (raw.audience_level as PresentationPlan['audience_level'])
      : 'grad_student',
    slides,
    generation_notes: String(raw.generation_notes ?? ''),
  };
}

export class ContentStructurer {
  private client: AnthropicClient;
  private profile: LecturerProfile;

  constructor(client: AnthropicClient, profile: LecturerProfile) {
    this.client = client;
    this.profile = profile;
  }

  async structureDocument(
    doc: ParsedDocument,
    audience: AudienceLevel
  ): Promise<PresentationPlan> {
    const systemPrompt = buildSystemPrompt(this.profile, audience);
    const userContent = buildUserContent(doc);
    const schema = getPresentationPlanJsonSchema();

    console.log('[Structurer] Sending request to Claude API...');
    const result = await this.client.createStructured<PresentationPlan>({
      system: systemPrompt,
      userContent,
      toolName: 'create_presentation_plan',
      toolDescription: '入力コンテンツから講義スライドの構成を作成する',
      responseSchema: schema,
      maxTokens: 16384,
      temperature: 0.3,
    });

    console.log('[Structurer] Raw API result:', JSON.stringify(result).substring(0, 500));

    const parseResult = PresentationPlanSchema.safeParse(result);
    if (!parseResult.success) {
      console.error('[Structurer] Zod parse errors:', parseResult.error.issues);
      // Try to salvage the data by coercing it
      const coerced = coercePlan(result as Record<string, unknown>);
      console.log('[Structurer] Coerced plan slides:', coerced.slides.length);
      return validateAndFix(coerced).plan;
    }

    console.log('[Structurer] Parsed plan slides:', parseResult.data.slides.length);
    return validateAndFix(parseResult.data).plan;
  }
}

export class PlanRefiner {
  private client: AnthropicClient;

  constructor(client: AnthropicClient) {
    this.client = client;
  }

  async refinePlan(
    currentPlan: PresentationPlan,
    instruction: string
  ): Promise<PresentationPlan> {
    const currentJson = JSON.stringify(currentPlan, null, 2);
    const userContent = `## 現在のスライド構成\n\`\`\`json\n${currentJson}\n\`\`\`\n\n## 修正指示\n${instruction}`;
    const schema = getPresentationPlanJsonSchema();

    const result = await this.client.createStructured<PresentationPlan>({
      system: REFINE_SYSTEM_PROMPT,
      userContent,
      toolName: 'create_presentation_plan',
      toolDescription: '修正後のスライド構成を返す',
      responseSchema: schema,
      maxTokens: 16384,
      temperature: 0.3,
    });

    const parseResult = PresentationPlanSchema.safeParse(result);
    if (!parseResult.success) {
      console.error('[Refiner] Zod parse errors:', parseResult.error.issues);
      const coerced = coercePlan(result as Record<string, unknown>);
      return validateAndFix(coerced).plan;
    }
    return validateAndFix(parseResult.data).plan;
  }
}
