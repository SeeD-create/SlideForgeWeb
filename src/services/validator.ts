import type { PresentationPlan, SlideContent } from '../schemas';

export interface ValidationWarning {
  slideNumber: number;
  message: string;
}

export function validateAndFix(plan: PresentationPlan): {
  plan: PresentationPlan;
  warnings: ValidationWarning[];
} {
  const warnings: ValidationWarning[] = [];
  const slides = plan.slides.map((slide, index) => {
    const fixed = { ...slide };
    fixed.slide_number = index + 1;

    // Title truncation
    if (fixed.title.length > 80) {
      fixed.title = fixed.title.substring(0, 77) + '...';
      warnings.push({
        slideNumber: fixed.slide_number,
        message: 'タイトルが80文字を超えたため切り詰めました',
      });
    }

    // Table layout without table data
    if (fixed.layout_type === 'table' && !fixed.table) {
      fixed.layout_type = 'content';
      warnings.push({
        slideNumber: fixed.slide_number,
        message: 'table レイアウトですがテーブルデータがないため content に変更',
      });
    }

    // Diagram layout without mermaid_code
    if (fixed.layout_type === 'diagram' && !fixed.diagram?.mermaid_code) {
      fixed.layout_type = 'content';
      warnings.push({
        slideNumber: fixed.slide_number,
        message: 'diagram レイアウトですが Mermaid コードがないため content に変更',
      });
    }

    // content_with_image without image
    if (
      fixed.layout_type === 'content_with_image' &&
      !fixed.image_ref &&
      !fixed.image_prompt
    ) {
      fixed.layout_type = 'content';
      warnings.push({
        slideNumber: fixed.slide_number,
        message: 'content_with_image ですが画像がないため content に変更',
      });
    }

    // Key message warning
    if (
      !fixed.key_message &&
      fixed.layout_type !== 'title' &&
      fixed.layout_type !== 'section_header'
    ) {
      warnings.push({
        slideNumber: fixed.slide_number,
        message: 'key_message が未設定です',
      });
    }

    // Bullet count warning
    if (fixed.bullets.length > 7) {
      warnings.push({
        slideNumber: fixed.slide_number,
        message: `箇条書きが ${fixed.bullets.length} 個あります（7個以下推奨）`,
      });
    }

    return fixed;
  });

  return {
    plan: {
      ...plan,
      slides,
      total_slides: slides.length,
    },
    warnings,
  };
}
