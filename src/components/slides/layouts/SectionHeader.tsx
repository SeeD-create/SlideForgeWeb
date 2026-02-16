import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function SectionHeader({ slide, profile }: Props) {
  const { colors } = profile;
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      <div
        className="absolute left-0 top-0 w-[0.6%] h-full"
        style={{ backgroundColor: colors.primary }}
      />
      <div className="absolute inset-0 flex flex-col justify-center pl-[10%] pr-[15%]">
        <h2
          className="font-bold leading-tight"
          style={{
            color: colors.primary,
            fontSize: 'clamp(20px, 3.5vw, 40px)',
          }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className="mt-[2%]"
            style={{
              color: colors.text_light,
              fontSize: 'clamp(12px, 1.6vw, 20px)',
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
