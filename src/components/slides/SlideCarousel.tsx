import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SlideContent, LecturerProfile } from '../../schemas';
import { SlidePreview } from './SlidePreview';

interface SlideCarouselProps {
  slides: SlideContent[];
  profile: LecturerProfile;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  generatedImages: Record<number, string>;
}

export function SlideCarousel({ slides, profile, currentIndex, onIndexChange, generatedImages }: SlideCarouselProps) {
  const slide = slides[currentIndex];
  if (!slide) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < slides.length - 1;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full relative">
        <div className="aspect-video border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
          <SlidePreview
            slide={slide}
            profile={profile}
            totalSlides={slides.length}
            imageData={generatedImages[slide.slide_number]}
          />
        </div>
        {/* Nav arrows */}
        <button
          onClick={() => hasPrev && onIndexChange(currentIndex - 1)}
          disabled={!hasPrev}
          className="absolute left-[-40px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => hasNext && onIndexChange(currentIndex + 1)}
          disabled={!hasNext}
          className="absolute right-[-40px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {/* Slide info */}
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-700">
          {slide.slide_number} / {slides.length}: {slide.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {slide.layout_type} {slide.key_message ? `- ${slide.key_message}` : ''}
        </p>
      </div>
    </div>
  );
}
