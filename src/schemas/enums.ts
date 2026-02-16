import { z } from 'zod';

export const SourceType = z.enum(['pdf', 'text', 'docx', 'url', 'unknown']);
export type SourceType = z.infer<typeof SourceType>;

export const AudienceLevel = z.enum(['pharmacy_undergrad', 'grad_student', 'researcher', 'general']);
export type AudienceLevel = z.infer<typeof AudienceLevel>;

export const SlideLayoutType = z.enum([
  'title', 'section_header', 'content', 'content_with_image',
  'two_column', 'table', 'diagram', 'key_takeaway',
]);
export type SlideLayoutType = z.infer<typeof SlideLayoutType>;

export const DiagramType = z.enum(['flowchart', 'comparison_table', 'sequence', 'timeline']);
export type DiagramType = z.infer<typeof DiagramType>;
