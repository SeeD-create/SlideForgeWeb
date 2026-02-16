import type { FontConfig } from '../../schemas';

interface FontSelectorProps {
  fonts: FontConfig;
  onChange: (key: keyof FontConfig, value: string | number) => void;
}

const JP_FONTS = ['游ゴシック', 'メイリオ', 'ヒラギノ角ゴ', 'Noto Sans JP', 'MS ゴシック'];
const EN_FONTS = ['Calibri', 'Arial', 'Segoe UI', 'Helvetica', 'Times New Roman'];

export function FontSelector({ fonts, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">日本語フォント</label>
          <select
            value={fonts.japanese}
            onChange={(e) => onChange('japanese', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          >
            {JP_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">欧文フォント</label>
          <select
            value={fonts.latin}
            onChange={(e) => onChange('latin', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          >
            {EN_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">タイトル: {fonts.title_size_pt}pt</label>
          <input type="range" min={18} max={54} value={fonts.title_size_pt}
            onChange={(e) => onChange('title_size_pt', Number(e.target.value))}
            className="w-full accent-blue-600" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">本文: {fonts.body_size_pt}pt</label>
          <input type="range" min={12} max={30} value={fonts.body_size_pt}
            onChange={(e) => onChange('body_size_pt', Number(e.target.value))}
            className="w-full accent-blue-600" />
        </div>
      </div>
    </div>
  );
}
