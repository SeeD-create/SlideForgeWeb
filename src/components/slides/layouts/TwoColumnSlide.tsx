import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function TwoColumnSlide({ slide, profile, totalSlides }: Props) {
  const { colors } = profile;
  const midPoint = Math.ceil(slide.bullets.length / 2);
  const leftBullets = slide.bullets.slice(0, midPoint);
  const rightBullets = slide.bullets.slice(midPoint);

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
      {/* Left column */}
      <div className="absolute overflow-hidden" style={{ left: '7.5%', top: '22%', width: '41%', height: '70%' }}>
        <div className="flex flex-col justify-start pt-[3%] space-y-[2%]">
          {leftBullets.map((b, i) => (
            <div key={i} className="flex items-start gap-[2%]" style={{ color: colors.text_dark, fontSize: 'clamp(9px, 1.2vw, 16px)' }}>
              <span style={{ color: colors.accent }} className="shrink-0">●</span>
              <span className={b.bold ? 'font-bold' : ''}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Divider */}
      <div className="absolute" style={{ left: '50%', top: '22%', width: 1, height: '65%', backgroundColor: '#ddd' }} />
      {/* Right column */}
      <div className="absolute overflow-hidden" style={{ left: '52%', top: '22%', width: '41%', height: '70%' }}>
        <div className="flex flex-col justify-start pt-[3%] space-y-[2%]">
          {rightBullets.map((b, i) => (
            <div key={i} className="flex items-start gap-[2%]" style={{ color: colors.text_dark, fontSize: 'clamp(9px, 1.2vw, 16px)' }}>
              <span style={{ color: colors.secondary }} className="shrink-0">●</span>
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
