import type { LecturerProfile } from '../../schemas';
import { cn } from '../../lib/cn';

interface ThemePresetCardProps {
  preset: LecturerProfile;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemePresetCard({ preset, isSelected, onClick }: ThemePresetCardProps) {
  const { colors } = preset;

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 p-4 transition-all text-left w-full',
        isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow'
      )}
    >
      {/* Mini slide preview */}
      <div className="aspect-video bg-white rounded-lg border border-gray-100 overflow-hidden mb-3 relative">
        {/* Accent bar */}
        <div
          className="absolute left-[7%] top-[8%] w-[1%] h-[25%] rounded-sm"
          style={{ backgroundColor: colors.primary }}
        />
        {/* Title text */}
        <div className="absolute left-[10%] top-[10%] w-[60%] h-[4px] rounded" style={{ backgroundColor: colors.primary }} />
        <div className="absolute left-[10%] top-[22%] w-[40%] h-[3px] rounded" style={{ backgroundColor: colors.text_light }} />
        {/* Separator */}
        <div className="absolute left-[7%] top-[35%] w-[86%] h-[1px]" style={{ backgroundColor: '#ddd' }} />
        {/* Bullets */}
        <div className="absolute left-[10%] top-[42%] w-[50%] h-[2px] rounded" style={{ backgroundColor: colors.text_dark }} />
        <div className="absolute left-[10%] top-[52%] w-[55%] h-[2px] rounded" style={{ backgroundColor: colors.text_dark }} />
        <div className="absolute left-[10%] top-[62%] w-[45%] h-[2px] rounded" style={{ backgroundColor: colors.text_dark }} />
        {/* Color swatches */}
        <div className="absolute right-[5%] bottom-[5%] flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-800">{preset.display_name || preset.name}</p>
    </button>
  );
}
