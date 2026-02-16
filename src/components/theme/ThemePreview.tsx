import type { LecturerProfile } from '../../schemas';

interface ThemePreviewProps {
  profile: LecturerProfile;
}

export function ThemePreview({ profile }: ThemePreviewProps) {
  const { colors, fonts } = profile;
  const scale = 0.4;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div
        className="relative"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: colors.background,
          fontFamily: `"${fonts.japanese}", "${fonts.latin}", sans-serif`,
        }}
      >
        {/* Accent bar */}
        <div
          className="absolute"
          style={{
            left: '7.5%',
            top: '4%',
            width: '0.6%',
            height: '13.3%',
            backgroundColor: colors.primary,
            borderRadius: 2,
          }}
        />
        {/* Title */}
        <div
          className="absolute font-bold"
          style={{
            left: '9.75%',
            top: '5%',
            fontSize: `${fonts.title_size_pt * scale}px`,
            color: colors.primary,
          }}
        >
          サンプルスライド
        </div>
        {/* Separator */}
        <div
          className="absolute"
          style={{
            left: '7.5%',
            top: '18%',
            width: '85%',
            height: 1,
            backgroundColor: '#ccc',
          }}
        />
        {/* Bullets */}
        {['最初のポイント', '次のポイント', '最後のポイント'].map((text, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-2"
            style={{
              left: '9.75%',
              top: `${24 + i * 12}%`,
              fontSize: `${fonts.body_size_pt * scale}px`,
              color: colors.text_dark,
            }}
          >
            <span style={{ color: colors.accent }}>●</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
