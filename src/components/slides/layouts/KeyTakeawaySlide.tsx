import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function KeyTakeawaySlide({ slide, profile, totalSlides }: Props) {
  const { colors } = profile;
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      {/* Left accent bar full height */}
      <div className="absolute left-0 top-0 w-[1.2%] h-full" style={{ backgroundColor: colors.accent }} />
      {/* Key message area */}
      <div className="absolute flex flex-col justify-center" style={{ left: '10%', top: '8%', width: '80%', height: '35%' }}>
        <p className="font-bold leading-snug" style={{ color: colors.primary, fontSize: 'clamp(16px, 2.5vw, 32px)' }}>
          {slide.key_message || slide.title}
        </p>
      </div>
      {/* Separator */}
      <div className="absolute" style={{ left: '10%', top: '48%', width: '80%', height: 2, backgroundColor: colors.accent }} />
      {/* Supporting bullets */}
      <div className="absolute overflow-hidden" style={{ left: '10%', top: '52%', width: '80%', height: '40%' }}>
        <div className="flex flex-col justify-start pt-[2%] space-y-[2%]">
          {slide.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-[2%]" style={{ color: colors.text_dark, fontSize: 'clamp(9px, 1.2vw, 16px)' }}>
              <span style={{ color: colors.accent }} className="shrink-0">★</span>
              <span className={b.bold ? 'font-bold' : ''}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Slide number */}
      <div className="absolute text-[10px]" style={{ right: '3%', bottom: '2%', color: colors.text_light }}>
        {slide.slide_number} / {totalSlides}
      </div>
    </div>
  );
}
