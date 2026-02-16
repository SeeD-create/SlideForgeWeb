import type { ColorScheme } from '../../schemas';

interface ColorPickerProps {
  colors: ColorScheme;
  onChange: (key: keyof ColorScheme, value: string) => void;
}

const COLOR_LABELS: Record<keyof ColorScheme, string> = {
  primary: 'プライマリ',
  secondary: 'セカンダリ',
  accent: 'アクセント',
  background: '背景',
  text_dark: 'テキスト（濃）',
  text_light: 'テキスト（薄）',
};

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.keys(COLOR_LABELS) as (keyof ColorScheme)[]).map((key) => (
        <div key={key}>
          <label className="block text-xs text-gray-500 mb-1">{COLOR_LABELS[key]}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200"
            />
            <span className="text-xs text-gray-400 font-mono">{colors[key]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
