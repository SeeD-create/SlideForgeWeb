import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
  imageData?: string;
}

export function ContentImageSlide({ slide, profile, totalSlides, imageData }: Props) {
  const { colors } = profile;
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
      {/* Left: Bullets (narrower) */}
      <div className="absolute overflow-hidden" style={{ left: '9.75%', top: '22%', width: '43%', height: '70%' }}>
        <div className="flex flex-col justify-center h-full space-y-[2%]">
          {slide.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-[2%]" style={{ paddingLeft: `${bullet.level * 5}%`, color: colors.text_dark, fontSize: 'clamp(9px, 1.2vw, 16px)' }}>
              <span style={{ color: bullet.level === 0 ? colors.accent : colors.text_light }} className="mt-[0.3%] shrink-0">{bullet.level === 0 ? '●' : '○'}</span>
              <span className={bullet.bold ? 'font-bold' : ''}>{bullet.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Right: Image */}
      <div className="absolute flex items-center justify-center bg-gray-50 rounded" style={{ left: '55%', top: '22%', width: '37.5%', height: '60%' }}>
        {imageData ? (
          <img src={imageData} alt="" className="w-full h-full object-contain rounded" />
        ) : (
          <div className="text-center text-gray-400 text-xs p-4">
            <p>画像</p>
            <p className="mt-1 text-[8px]">{slide.image_ref || 'No image'}</p>
          </div>
        )}
      </div>
      {/* Slide number */}
      <div className="absolute text-[10px]" style={{ right: '3%', bottom: '2%', color: colors.text_light }}>
        {slide.slide_number} / {totalSlides}
      </div>
    </div>
  );
}
