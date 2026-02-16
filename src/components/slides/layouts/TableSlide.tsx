import type { SlideContent, LecturerProfile } from '../../../schemas';

interface Props {
  slide: SlideContent;
  profile: LecturerProfile;
  totalSlides: number;
}

export function TableSlide({ slide, profile, totalSlides }: Props) {
  const { colors } = profile;
  const table = slide.table;

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: colors.background }}>
      <div className="absolute" style={{ left: '7.5%', top: '4%', width: '0.6%', height: '13.3%', backgroundColor: colors.primary, borderRadius: 2 }} />
      <div className="absolute font-bold truncate" style={{ left: '9.75%', top: '4%', width: '82.5%', height: '13.3%', display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 'clamp(14px, 2.2vw, 28px)' }}>
        {slide.title}
      </div>
      <div className="absolute" style={{ left: '7.5%', top: '18%', width: '85%', height: 1, backgroundColor: '#ccc' }} />
      {/* Table */}
      <div className="absolute overflow-auto" style={{ left: '7.5%', top: '22%', width: '85%', height: '68%' }}>
        {table ? (
          <table className="w-full border-collapse" style={{ fontSize: 'clamp(8px, 1vw, 14px)' }}>
            <thead>
              <tr>
                {table.headers.map((h, i) => (
                  <th key={i} className="border px-2 py-1.5 text-left font-bold text-white" style={{ backgroundColor: colors.primary }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-200 px-2 py-1" style={{ color: colors.text_dark }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">テーブルデータなし</p>
        )}
      </div>
      <div className="absolute text-[10px]" style={{ right: '3%', bottom: '2%', color: colors.text_light }}>
        {slide.slide_number} / {totalSlides}
      </div>
    </div>
  );
}
