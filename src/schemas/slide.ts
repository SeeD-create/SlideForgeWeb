import { z } from 'zod';
import { AudienceLevel, DiagramType, SlideLayoutType } from './enums';

export const BulletPointSchema = z.object({
  text: z.string(),
  level: z.number().int().min(0).max(3).default(0),
  bold: z.boolean().default(false),
});
export type BulletPoint = z.infer<typeof BulletPointSchema>;

export const TableDataSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  caption: z.string().default(''),
});
export type TableData = z.infer<typeof TableDataSchema>;

export const DiagramSpecSchema = z.object({
  diagram_type: DiagramType,
  mermaid_code: z.string(),
  caption: z.string().default(''),
  fallback_description: z.string().default(''),
});
export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;

export const SlideContentSchema = z.object({
  slide_number: z.number().int(),
  layout_type: SlideLayoutType,
  title: z.string().default(''),
  subtitle: z.string().default(''),
  bullets: z.array(BulletPointSchema).default([]),
  notes: z.string().default(''),
  table: TableDataSchema.nullable().default(null),
  diagram: DiagramSpecSchema.nullable().default(null),
  image_ref: z.string().nullable().default(null),
  image_prompt: z.string().default(''),
  key_message: z.string().default(''),
});
export type SlideContent = z.infer<typeof SlideContentSchema>;

export const PresentationPlanSchema = z.object({
  paper_title: z.string().default(''),
  lecture_title: z.string().default(''),
  total_slides: z.number().int().default(0),
  audience_level: AudienceLevel.default('grad_student'),
  slides: z.array(SlideContentSchema).default([]),
  generation_notes: z.string().default(''),
});
export type PresentationPlan = z.infer<typeof PresentationPlanSchema>;
