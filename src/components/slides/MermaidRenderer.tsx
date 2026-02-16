import { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="p-4 text-xs text-red-500 bg-red-50 rounded">
        <p>Mermaid rendering error</p>
        <pre className="mt-1 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return <div ref={ref} className="w-full h-full flex items-center justify-center" />;
}
