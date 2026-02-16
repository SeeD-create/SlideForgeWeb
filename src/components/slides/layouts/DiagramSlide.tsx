import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { SlideContent, LecturerProfile } from '../../../schemas';

// Mermaid の初期化（一度だけ）
let mermaidInitialized = false;
function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'sans-serif',
    flowchart: { useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true },
  });
  mermaidInitialized = true;
}

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function DiagramSlide({ slide, profile, totalSlides }: Props) {
  const { colors } = profile;
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slide.diagram?.mermaid_code) return;

    ensureMermaidInit();

    const id = `mermaid-${slide.slide_number}-${Date.now()}`;

    (async () => {
      try {
        const { svg } = await mermaid.render(id, slide.diagram!.mermaid_code);
        setSvgHtml(svg);
        setError(null);
      } catch (e) {
        console.warn('[DiagramSlide] Mermaid render error:', e);
        setError(e instanceof Error ? e.message : 'Mermaid レンダリングエラー');
        setSvgHtml(null);
      }
    })();
  }, [slide.diagram?.mermaid_code, slide.slide_number]);

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      {/* Accent bar */}
      <div className="absolute" style={{ left: '7.5%', top: '4%', width: '0.6%', height: '13.3%', backgroundColor: colors.primary, borderRadius: 2 }} />
      {/* Title */}
      <div className="absolute font-bold truncate" style={{ left: '9.75%', top: '4%', width: '82.5%', height: '13.3%', display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 'clamp(14px, 2.2vw, 28px)' }}>
        {slide.title}
      </div>
      {/* Separator */}
      <div className="absolute" style={{ left: '7.5%', top: '18%', width: '85%', height: 1, backgroundColor: '#ccc' }} />

      {/* Diagram area */}
      <div
        ref={containerRef}
        className="absolute flex items-center justify-center overflow-hidden"
        style={{ left: '5%', top: '20%', width: '90%', height: '70%' }}
      >
        {slide.diagram ? (
          svgHtml ? (
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          ) : error ? (
            /* Mermaid パース失敗時: fallback テキスト表示 */
            <div className="text-center w-full px-4">
              {slide.diagram.fallback_description ? (
                <p className="text-xs leading-relaxed" style={{ color: colors.text_dark }}>
                  {slide.diagram.fallback_description}
                </p>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <pre className="text-[9px] text-gray-500 text-left whitespace-pre-wrap overflow-auto max-h-[180px]">
                    {slide.diagram.mermaid_code}
                  </pre>
                </div>
              )}
              {slide.diagram.caption && (
                <p className="text-[10px] mt-1" style={{ color: colors.text_light }}>{slide.diagram.caption}</p>
              )}
            </div>
          ) : (
            /* Loading state */
            <div className="text-gray-400 text-xs">ダイアグラム描画中...</div>
          )
        ) : (
          <p className="text-gray-400 text-xs">ダイアグラムなし</p>
        )}
      </div>

      {/* Slide number */}
      <div className="absolute text-[10px]" style={{ right: '3%', bottom: '2%', color: colors.text_light }}>
        {slide.slide_number} / {totalSlides}
      </div>
    </div>
  );
}
