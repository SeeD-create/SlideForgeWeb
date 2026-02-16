import type { PresentationPlan } from '../schemas';

export class ImageGenerator {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'imagen-4.0-generate-001') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateForPlan(
    plan: PresentationPlan,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ updatedPlan: PresentationPlan; generatedCount: number; images: Record<number, string> }> {
    const eligibleSlides = plan.slides.filter(
      (s) => s.image_prompt && !s.image_ref
    );
    const total = eligibleSlides.length;
    let generatedCount = 0;
    const images: Record<number, string> = {};
    let current = 0;

    for (const slide of plan.slides) {
      if (slide.image_ref || !slide.image_prompt) continue;

      current++;
      onProgress?.(current, total);

      try {
        const dataUrl = await this.generateImage(slide.image_prompt);
        if (dataUrl) {
          slide.image_ref = `generated_slide_${slide.slide_number}.png`;
          images[slide.slide_number] = dataUrl;
          if (
            slide.layout_type !== 'content_with_image' &&
            slide.layout_type !== 'diagram'
          ) {
            slide.layout_type = 'content_with_image';
          }
          generatedCount++;
        }
      } catch (e) {
        console.warn(`Image generation failed for slide #${slide.slide_number}:`, e);
      }
    }

    return {
      updatedPlan: { ...plan, slides: [...plan.slides] },
      generatedCount,
      images,
    };
  }

  private async generateImage(prompt: string): Promise<string | null> {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey: this.apiKey });

    const response = await client.models.generateImages({
      model: this.model,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/png',
        personGeneration: 'DONT_ALLOW',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${imageBytes}`;
    }

    console.warn('No images generated for prompt:', prompt.substring(0, 80));
    return null;
  }
}
