import { z } from 'zod';
import { AudienceLevel } from './enums';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const FontConfigSchema = z.object({
  japanese: z.string().default('游ゴシック'),
  latin: z.string().default('Calibri'),
  title_size_pt: z.number().int().min(18).max(54).default(32),
  subtitle_size_pt: z.number().int().min(14).max(40).default(24),
  body_size_pt: z.number().int().min(12).max(30).default(18),
  caption_size_pt: z.number().int().min(10).max(20).default(14),
});
export type FontConfig = z.infer<typeof FontConfigSchema>;

export const ColorSchemeSchema = z.object({
  primary: hexColor.default('#2B579A'),
  secondary: hexColor.default('#217346'),
  accent: hexColor.default('#B7472A'),
  background: hexColor.default('#FFFFFF'),
  text_dark: hexColor.default('#333333'),
  text_light: hexColor.default('#666666'),
});
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

export const LecturerProfileSchema = z.object({
  name: z.string(),
  display_name: z.string().default(''),
  affiliation: z.string().default(''),
  fonts: FontConfigSchema.default({}),
  colors: ColorSchemeSchema.default({}),
  default_audience: AudienceLevel.default('grad_student'),
  explanation_depth: z.enum(['brief', 'standard', 'detailed']).default('standard'),
  max_bullets_per_slide: z.number().int().min(2).max(8).default(5),
  prefer_diagrams: z.boolean().default(true),
  custom_instructions: z.string().default(''),
  language: z.enum(['ja', 'en']).default('ja'),
});
export type LecturerProfile = z.infer<typeof LecturerProfileSchema>;
