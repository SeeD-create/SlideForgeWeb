import { z } from 'zod';
import { SourceType } from './enums';

export const ExtractedFigureSchema = z.object({
  page_number: z.number().int().default(0),
  image_data: z.string().default(''),
  caption: z.string().default(''),
  figure_id: z.string().default(''),
});
export type ExtractedFigure = z.infer<typeof ExtractedFigureSchema>;

export const PaperSectionSchema = z.object({
  heading: z.string(),
  level: z.number().int().min(1).max(4).default(1),
  content: z.string(),
});
export type PaperSection = z.infer<typeof PaperSectionSchema>;

export const ParsedDocumentSchema = z.object({
  title: z.string().default(''),
  authors: z.array(z.string()).default([]),
  abstract: z.string().default(''),
  sections: z.array(PaperSectionSchema).default([]),
  figures: z.array(ExtractedFigureSchema).default([]),
  full_markdown: z.string().default(''),
  source_type: SourceType.default('unknown'),
  total_pages: z.number().int().default(0),
});
export type ParsedDocument = z.infer<typeof ParsedDocumentSchema>;
