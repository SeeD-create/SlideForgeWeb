/**
 * PresentationPlan から PPTX ファイルを生成するビルダー。
 * Python pptx_builder.py からの移植。pptxgenjs を使用。
 *
 * デザインコンセプト:
 * - 白ベースの清潔感あるデザイン
 * - タイトルは白背景 + 左端のアクセントバー + 下線
 * - Primary色はテキストとアクセント要素のみに使用
 */

import PptxGenJS from 'pptxgenjs';
import type { PresentationPlan, SlideContent, LecturerProfile, BulletPoint } from '../schemas';
import { pptxColor } from '../lib/colors';
import { renderMermaidToPng } from './mermaid-renderer';

export class PptxBuilder {
  private pptx: PptxGenJS;
  private plan: PresentationPlan;
  private profile: LecturerProfile;
  private images: Record<number, string>;
  /** Mermaid → PNG のレンダリング済みキャッシュ (slideNumber → dataUrl) */
  private diagramImages: Record<number, string> = {};

  constructor(
    plan: PresentationPlan,
    profile: LecturerProfile,
    images: Record<number, string> = {}
  ) {
    this.plan = plan;
    this.profile = profile;
    this.images = images;
    this.pptx = new PptxGenJS();
    this.pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"
    this.pptx.author = 'SlideForge Web';
    this.pptx.title = plan.lecture_title || plan.paper_title || 'Presentation';
  }

  async build(): Promise<Blob> {
    console.log(`[PptxBuilder] Starting build for ${this.plan.slides.length} slides...`);

    // ダイアグラムスライドの Mermaid コードを事前に PNG に変換
    await this.preRenderDiagrams();

    console.log('[PptxBuilder] Adding slides to PPTX...');
    for (const sc of this.plan.slides) {
      try {
        this.addSlide(sc);
      } catch (e) {
        console.error(`[PptxBuilder] Error adding slide ${sc.slide_number} (${sc.layout_type}):`, e);
        // エラーが出ても他のスライドは続行
      }
    }

    console.log('[PptxBuilder] Writing PPTX blob...');
    const blob = (await this.pptx.write({ outputType: 'blob' })) as Blob;
    console.log(`[PptxBuilder] Done! Blob size: ${blob.size} bytes`);
    return blob;
  }

  /** ダイアグラムスライドの Mermaid → PNG を事前レンダリング */
  private async preRenderDiagrams(): Promise<void> {
    const diagramSlides = this.plan.slides.filter(
      (s) => s.layout_type === 'diagram' && s.diagram?.mermaid_code
    );
    console.log(`[PptxBuilder] Pre-rendering ${diagramSlides.length} diagram(s)...`);

    // 全ダイアグラムを並行処理（各ダイアグラムは内部でタイムアウトあり）
    const results = await Promise.allSettled(
      diagramSlides.map(async (sc) => {
        try {
          console.log(`[PptxBuilder] Rendering diagram for slide ${sc.slide_number}...`);
          const png = await renderMermaidToPng(sc.diagram!.mermaid_code);
          if (png) {
            this.diagramImages[sc.slide_number] = png;
            console.log(`[PptxBuilder] Diagram for slide ${sc.slide_number} rendered successfully`);
          } else {
            console.warn(`[PptxBuilder] Diagram for slide ${sc.slide_number} returned null`);
          }
        } catch (e) {
          console.warn(`[PptxBuilder] Mermaid render failed for slide ${sc.slide_number}:`, e);
        }
      })
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`[PptxBuilder] Diagram pre-render complete: ${succeeded}/${diagramSlides.length}`);
  }

  private addSlide(sc: SlideContent): void {
    const builders: Record<string, (sc: SlideContent) => void> = {
      title: (s) => this.buildTitleSlide(s),
      section_header: (s) => this.buildSectionHeader(s),
      content: (s) => this.buildContentSlide(s),
      content_with_image: (s) => this.buildContentImageSlide(s),
      two_column: (s) => this.buildTwoColumnSlide(s),
      table: (s) => this.buildTableSlide(s),
      diagram: (s) => this.buildDiagramSlide(s),
      key_takeaway: (s) => this.buildTakeawaySlide(s),
    };
    const builder = builders[sc.layout_type] ?? builders.content;
    builder(sc);
  }

  // ── helpers ──

  private get c() {
    return this.profile.colors;
  }

  private get f() {
    return this.profile.fonts;
  }

  private addSlideNumber(slide: PptxGenJS.Slide, sc: SlideContent): void {
    slide.addText(`${sc.slide_number} / ${this.plan.total_slides}`, {
      x: 12.0,
      y: 7.0,
      w: 1.0,
      h: 0.4,
      fontSize: 10,
      color: pptxColor(this.c.text_light),
      fontFace: this.f.latin,
      align: 'right',
    });
  }

  private addNotes(slide: PptxGenJS.Slide, sc: SlideContent): void {
    if (sc.notes) {
      slide.addNotes(sc.notes);
    }
  }

  private addAccentBar(slide: PptxGenJS.Slide): void {
    slide.addShape('rect', {
      x: 1.0,
      y: 0.3,
      w: 0.08,
      h: 1.0,
      fill: { color: pptxColor(this.c.primary) },
      line: { width: 0 },
    });
  }

  private addTitleText(slide: PptxGenJS.Slide, title: string): void {
    slide.addText(title, {
      x: 1.3,
      y: 0.3,
      w: 11.0,
      h: 1.0,
      fontSize: this.f.title_size_pt,
      color: pptxColor(this.c.primary),
      fontFace: this.f.japanese,
      bold: true,
      valign: 'middle',
    });
  }

  private addSeparator(slide: PptxGenJS.Slide): void {
    slide.addShape('rect', {
      x: 1.0,
      y: 1.35,
      w: 11.333,
      h: 0.02,
      fill: { color: 'CCCCCC' },
      line: { width: 0 },
    });
  }

  private addTitleBar(slide: PptxGenJS.Slide, title: string): void {
    this.addAccentBar(slide);
    this.addTitleText(slide, title);
    this.addSeparator(slide);
  }

  private bulletsToTextProps(
    bullets: BulletPoint[]
  ): PptxGenJS.TextProps[] {
    return bullets.map((b) => ({
      text: b.text,
      options: {
        fontSize: Math.max(this.f.body_size_pt - b.level * 2, 12),
        color: pptxColor(this.c.text_dark),
        fontFace: this.f.japanese,
        bold: b.bold,
        bullet: {
          code: b.level === 0 ? '2022' : '25CB', // ● or ○
          color: pptxColor(b.level === 0 ? this.c.accent : this.c.text_light),
        },
        indentLevel: b.level,
        paraSpaceBefore: 6,
        paraSpaceAfter: 4,
      },
    }));
  }

  // ── Layout Builders ──

  private buildTitleSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();

    // Top accent line
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.06,
      fill: { color: pptxColor(this.c.primary) },
      line: { width: 0 },
    });

    // Bottom bar
    slide.addShape('rect', {
      x: 0,
      y: 7.0,
      w: 13.333,
      h: 0.5,
      fill: { color: pptxColor(this.c.primary) },
      line: { width: 0 },
    });

    // Title text (centered)
    slide.addText(sc.title, {
      x: 2.0,
      y: 2.0,
      w: 9.333,
      h: 2.0,
      fontSize: this.f.title_size_pt + 4,
      color: pptxColor(this.c.primary),
      fontFace: this.f.japanese,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Subtitle
    if (sc.subtitle) {
      slide.addText(sc.subtitle, {
        x: 2.0,
        y: 4.2,
        w: 9.333,
        h: 1.0,
        fontSize: this.f.subtitle_size_pt,
        color: pptxColor(this.c.text_light),
        fontFace: this.f.japanese,
        align: 'center',
        valign: 'top',
      });
    }

    // Accent line
    slide.addShape('rect', {
      x: 4.0,
      y: 5.5,
      w: 5.333,
      h: 0.04,
      fill: { color: pptxColor(this.c.accent) },
      line: { width: 0 },
    });

    this.addNotes(slide, sc);
  }

  private buildSectionHeader(sc: SlideContent): void {
    const slide = this.pptx.addSlide();

    // Left accent bar (full height)
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 0.08,
      h: 7.5,
      fill: { color: pptxColor(this.c.primary) },
      line: { width: 0 },
    });

    // Section title
    slide.addText(sc.title, {
      x: 1.5,
      y: 2.0,
      w: 10.0,
      h: 2.0,
      fontSize: this.f.title_size_pt + 8,
      color: pptxColor(this.c.primary),
      fontFace: this.f.japanese,
      bold: true,
      valign: 'middle',
    });

    if (sc.subtitle) {
      slide.addText(sc.subtitle, {
        x: 1.5,
        y: 4.2,
        w: 10.0,
        h: 1.0,
        fontSize: this.f.subtitle_size_pt,
        color: pptxColor(this.c.text_light),
        fontFace: this.f.japanese,
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildContentSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();
    this.addTitleBar(slide, sc.title);

    // Bullets
    if (sc.bullets.length > 0) {
      slide.addText(this.bulletsToTextProps(sc.bullets), {
        x: 1.0,
        y: 1.6,
        w: 11.333,
        h: 5.4,
        valign: 'middle',
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildContentImageSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();
    this.addTitleBar(slide, sc.title);

    // Left: bullets (narrower)
    if (sc.bullets.length > 0) {
      slide.addText(this.bulletsToTextProps(sc.bullets), {
        x: 1.0,
        y: 1.6,
        w: 5.833,
        h: 5.4,
        valign: 'middle',
      });
    }

    // Right: image
    const imgData = this.images[sc.slide_number];
    if (imgData) {
      slide.addImage({
        data: imgData,
        x: 7.333,
        y: 1.6,
        w: 5.0,
        h: 4.5,
      });
    } else {
      // Placeholder rectangle
      slide.addShape('rect', {
        x: 7.333,
        y: 1.6,
        w: 5.0,
        h: 4.5,
        fill: { color: 'F5F5F5' },
        line: { color: 'CCCCCC', width: 1 },
      });
      slide.addText(sc.image_ref || '画像', {
        x: 7.333,
        y: 3.5,
        w: 5.0,
        h: 1.0,
        fontSize: 12,
        color: '999999',
        align: 'center',
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildTwoColumnSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();
    this.addTitleBar(slide, sc.title);

    const midPoint = Math.ceil(sc.bullets.length / 2);
    const leftBullets = sc.bullets.slice(0, midPoint);
    const rightBullets = sc.bullets.slice(midPoint);

    // Left column
    if (leftBullets.length > 0) {
      slide.addText(this.bulletsToTextProps(leftBullets), {
        x: 1.0,
        y: 1.6,
        w: 5.467,
        h: 5.4,
        valign: 'top',
      });
    }

    // Vertical divider
    slide.addShape('rect', {
      x: 6.667,
      y: 1.6,
      w: 0.02,
      h: 5.0,
      fill: { color: 'DDDDDD' },
      line: { width: 0 },
    });

    // Right column
    if (rightBullets.length > 0) {
      slide.addText(this.bulletsToTextProps(rightBullets), {
        x: 6.867,
        y: 1.6,
        w: 5.467,
        h: 5.4,
        valign: 'top',
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildTableSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();
    this.addTitleBar(slide, sc.title);

    if (sc.table) {
      const headerRow: PptxGenJS.TableCell[] = sc.table.headers.map((h) => ({
        text: h,
        options: {
          bold: true,
          color: 'FFFFFF',
          fill: { color: pptxColor(this.c.primary) },
          fontSize: this.f.body_size_pt - 2,
          fontFace: this.f.japanese,
          border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
          valign: 'middle' as const,
        },
      }));

      const dataRows: PptxGenJS.TableCell[][] = sc.table.rows.map(
        (row, ri) =>
          row.map((cell) => ({
            text: cell,
            options: {
              fontSize: this.f.body_size_pt - 2,
              color: pptxColor(this.c.text_dark),
              fontFace: this.f.japanese,
              fill: { color: ri % 2 === 0 ? 'FFFFFF' : 'F8F8F8' },
              border: { type: 'solid', pt: 0.5, color: 'DDDDDD' },
              valign: 'middle' as const,
            },
          }))
      );

      slide.addTable([headerRow, ...dataRows], {
        x: 1.0,
        y: 1.6,
        w: 11.333,
        colW: sc.table.headers.map(() => 11.333 / sc.table!.headers.length),
        border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
        autoPage: false,
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildDiagramSlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();
    this.addTitleBar(slide, sc.title);

    const diagramPng = this.diagramImages[sc.slide_number];

    if (diagramPng) {
      // Mermaid が正常にレンダリングされた → 画像として埋め込み
      slide.addImage({
        data: diagramPng,
        x: 1.0,
        y: 1.6,
        w: 11.333,
        h: 5.0,
        sizing: { type: 'contain', w: 11.333, h: 5.0 },
      });
    } else if (sc.diagram) {
      // フォールバック: テキスト表示
      const description =
        sc.diagram.fallback_description || sc.diagram.mermaid_code;
      slide.addText(description, {
        x: 1.0,
        y: 1.6,
        w: 11.333,
        h: 5.0,
        fontSize: this.f.body_size_pt - 2,
        color: pptxColor(this.c.text_dark),
        fontFace: this.f.japanese,
        valign: 'middle',
        align: 'center',
      });
    }

    if (sc.diagram?.caption) {
      slide.addText(sc.diagram.caption, {
        x: 1.0,
        y: 6.6,
        w: 11.333,
        h: 0.4,
        fontSize: this.f.caption_size_pt,
        color: pptxColor(this.c.text_light),
        fontFace: this.f.japanese,
        align: 'center',
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }

  private buildTakeawaySlide(sc: SlideContent): void {
    const slide = this.pptx.addSlide();

    // Left accent bar (full height)
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 0.16,
      h: 7.5,
      fill: { color: pptxColor(this.c.accent) },
      line: { width: 0 },
    });

    // Key message
    slide.addText(sc.key_message || sc.title, {
      x: 1.3,
      y: 0.8,
      w: 10.7,
      h: 2.5,
      fontSize: this.f.title_size_pt,
      color: pptxColor(this.c.primary),
      fontFace: this.f.japanese,
      bold: true,
      valign: 'middle',
    });

    // Separator
    slide.addShape('rect', {
      x: 1.3,
      y: 3.5,
      w: 10.7,
      h: 0.04,
      fill: { color: pptxColor(this.c.accent) },
      line: { width: 0 },
    });

    // Supporting bullets
    if (sc.bullets.length > 0) {
      const takeawayBullets: PptxGenJS.TextProps[] = sc.bullets.map((b) => ({
        text: b.text,
        options: {
          fontSize: this.f.body_size_pt,
          color: pptxColor(this.c.text_dark),
          fontFace: this.f.japanese,
          bold: b.bold,
          bullet: {
            code: '2605', // ★
            color: pptxColor(this.c.accent),
          },
          paraSpaceBefore: 8,
          paraSpaceAfter: 4,
        },
      }));

      slide.addText(takeawayBullets, {
        x: 1.3,
        y: 3.8,
        w: 10.7,
        h: 3.2,
        valign: 'top',
      });
    }

    this.addSlideNumber(slide, sc);
    this.addNotes(slide, sc);
  }
}
