/**
 * Mermaid コードを SVG → PNG (data URL) に変換するユーティリティ。
 * PPTX エクスポート時に画像として埋め込むために使用。
 */

import mermaid from 'mermaid';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'sans-serif',
    flowchart: { useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true },
  });
  initialized = true;
}

/**
 * Promise にタイムアウトを付与する
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} took longer than ${ms}ms`));
    }, ms);
    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

/**
 * Mermaid コードを PNG data URL に変換する。
 * @returns data:image/png;base64,... 形式の文字列。失敗時は null。
 */
export async function renderMermaidToPng(
  code: string,
  width = 1200,
  height = 800
): Promise<string | null> {
  ensureInit();

  try {
    const id = `mermaid-export-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Mermaid レンダリングに 10 秒のタイムアウトを設定
    const { svg } = await withTimeout(
      mermaid.render(id, code),
      10000,
      'Mermaid render'
    );

    // SVG → Canvas → PNG (5 秒タイムアウト)
    return await withTimeout(
      svgToPng(svg, width, height),
      5000,
      'SVG to PNG conversion'
    );
  } catch (e) {
    console.warn('[MermaidRenderer] Failed to render:', e);
    // 残留 DOM 要素をクリーンアップ
    try {
      const leftover = document.querySelectorAll('[id^="mermaid-export-"]');
      leftover.forEach((el) => el.remove());
    } catch { /* ignore */ }
    return null;
  }
}

function svgToPng(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas context not available'));

    // 白背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // SVG をキャンバス中央にフィットさせる
      const scale = Math.min(width / img.width, height / img.height) * 0.9;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };

    img.src = url;
  });
}
