import { cn } from '../../lib/cn';
import { Layers, FileText } from 'lucide-react';

interface SlideSelectorProps {
  totalSlides: number;
  selectedSlideIndex: number;  // -1 = 全体, 0-based index otherwise
  onSelectSlide: (index: number) => void;
}

export function SlideSelector({ totalSlides, selectedSlideIndex, onSelectSlide }: SlideSelectorProps) {
  if (totalSlides === 0) return null;

  return (
    <div className="px-3 py-2 border-t border-gray-100">
      <div className="flex items-center gap-1 mb-1.5">
        <FileText className="w-3 h-3 text-gray-400" />
        <span className="text-[10px] text-gray-400 font-medium">対象スライド</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {/* "全体" button = deselect specific slide, set to -1 */}
        <button
          onClick={() => onSelectSlide(-1)}
          className={cn(
            'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all',
            selectedSlideIndex === -1
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          )}
        >
          <span className="flex items-center gap-0.5">
            <Layers className="w-3 h-3" />
            全体
          </span>
        </button>
        {/* Individual slide buttons */}
        {Array.from({ length: totalSlides }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelectSlide(i)}
            className={cn(
              'min-w-[28px] px-1.5 py-0.5 rounded-full text-[11px] font-medium transition-all',
              selectedSlideIndex === i
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
