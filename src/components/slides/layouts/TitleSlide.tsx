import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function TitleSlide({ slide, profile }: Props) {
  const { colors } = profile;
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      {/* Primary color top bar */}
      <div className="absolute top-0 left-0 w-full h-[2%]" style={{ backgroundColor: colors.primary }} />
      {/* Title centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[15%]">
        <h1
          className="text-center font-bold leading-tight"
          style={{
            color: colors.primary,
            fontSize: 'clamp(18px, 3vw, 36px)',
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            className="mt-[3%] text-center"
            style={{
              color: colors.text_light,
              fontSize: 'clamp(12px, 1.8vw, 22px)',
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
      {/* Bottom accent line */}
      <div
        className="absolute bottom-[8%] left-[25%] w-[50%] h-[0.5%]"
        style={{ backgroundColor: colors.accent }}
      />
    </div>
  );
}
