import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedDocument } from '../schemas';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function parsePdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const totalPages = pdf.numPages;
  let fullText = '';
  const figures: ParsedDocument['figures'] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(Math.round((i / totalPages) * 80));

    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Reconstruct text from items
    const pageText = textContent.items
      .map((item: any) => {
        if ('str' in item) return item.str;
        return '';
      })
      .join(' ');

    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  onProgress?.(90);

  // Extract title (first significant line)
  const lines = fullText.split('\n').filter((l) => l.trim().length > 0);
  const title = lines[0]?.replace(/^--- Page \d+ ---$/, '').trim() || file.name;

  // Extract abstract if present
  let abstract = '';
  const abstractMatch = fullText.match(/abstract[:\s]*\n?([\s\S]*?)(?:\n(?:introduction|1\.|keywords))/i);
  if (abstractMatch) {
    abstract = abstractMatch[1].trim();
  }

  onProgress?.(100);

  return {
    title,
    authors: [],
    abstract,
    sections: [],
    figures,
    full_markdown: fullText,
    source_type: 'pdf',
    total_pages: totalPages,
  };
}
