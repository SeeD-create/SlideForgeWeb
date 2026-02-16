import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function ContentSlide({ slide, profile, totalSlides }: Props) {
  const { colors } = profile;
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      {/* Accent bar */}
      <div
        className="absolute"
        style={{
          left: '7.5%', top: '4%', width: '0.6%', height: '13.3%',
          backgroundColor: colors.primary, borderRadius: 2,
        }}
      />
      {/* Title */}
      <div
        className="absolute font-bold truncate"
        style={{
          left: '9.75%', top: '4%', width: '82.5%', height: '13.3%',
          display: 'flex', alignItems: 'center',
          color: colors.primary,
          fontSize: 'clamp(14px, 2.2vw, 28px)',
        }}
      >
        {slide.title}
      </div>
      {/* Separator */}
      <div className="absolute" style={{ left: '7.5%', top: '18%', width: '85%', height: 1, backgroundColor: '#ccc' }} />
      {/* Bullets */}
      <div className="absolute overflow-hidden" style={{ left: '9.75%', top: '22%', width: '82%', height: '70%' }}>
        <div className="flex flex-col justify-center h-full space-y-[1.5%]">
          {slide.bullets.map((bullet, i) => (
            <div
              key={i}
              className="flex items-start gap-[1%]"
              style={{
                paddingLeft: `${bullet.level * 5}%`,
                color: colors.text_dark,
                fontSize: 'clamp(10px, 1.4vw, 18px)',
              }}
            >
              <span style={{ color: bullet.level === 0 ? colors.accent : colors.text_light }} className="mt-[0.3%] shrink-0">
                {bullet.level === 0 ? '●' : '○'}
              </span>
              <span className={bullet.bold ? 'font-bold' : ''}>{bullet.text}</span>
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
