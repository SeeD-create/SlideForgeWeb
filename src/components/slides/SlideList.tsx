import type { SlideContent, LecturerProfile } from '../../schemas';
import { SlidePreview } from './SlidePreview';
import { cn } from '../../lib/cn';

interface SlideListProps {
  slides: SlideContent[];
  profile: LecturerProfile;
  selectedIndex: number;
  onSelect: (index: number) => void;
  generatedImages: Record<number, string>;
}

export function SlideList({ slides, profile, selectedIndex, onSelect, generatedImages }: SlideListProps) {
  return (
    <div className="space-y-2 overflow-y-auto pr-1">
      {slides.map((slide, index) => (
        <button
          key={slide.slide_number}
          onClick={() => onSelect(index)}
          className={cn(
            'w-full rounded-lg border-2 overflow-hidden transition-all',
            selectedIndex === index
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="aspect-video">
            <SlidePreview
              slide={slide}
              profile={profile}
              totalSlides={slides.length}
              imageData={generatedImages[slide.slide_number]}
            />
          </div>
          <div className="px-2 py-1 bg-white text-xs text-gray-500 truncate text-left">
            #{slide.slide_number} {slide.title}
          </div>
        </button>
      ))}
    </div>
  );
}
