import { useNavigate } from 'react-router-dom';
import { useAppStore, usePlanStore, useProfileStore } from '../../store';
import { AUDIENCE_LABELS, DEPTH_LABELS } from '../../lib/constants';
import { ArrowLeft, Sparkles, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { AudienceLevel } from '../../schemas';

const AUDIENCES: AudienceLevel[] = [
  'pharmacy_undergrad',
  'grad_student',
  'researcher',
  'general',
];

const DEPTHS = ['brief', 'standard', 'detailed'] as const;

export function Step3Config() {
  const navigate = useNavigate();
  const { setStep } = useAppStore();
  const { profile, setProfile } = useProfileStore();
  const {
    audienceLevel,
    setAudienceLevel,
    explanationDepth,
    setExplanationDepth,
    slideCountRange,
    setSlideCountRange,
  } = usePlanStore();

  const handleBack = () => {
    setStep(2);
    navigate('/input');
  };

  const handleGenerate = () => {
    setStep(4);
    navigate('/generate');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          設定
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          生成オプションを設定してください
        </p>
      </div>

      {/* Audience Level */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">聴衆レベル</h3>
        <div className="grid grid-cols-2 gap-3">
          {AUDIENCES.map((level) => (
            <button
              key={level}
              onClick={() => setAudienceLevel(level)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                audienceLevel === level
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="text-sm font-medium text-gray-800">
                {AUDIENCE_LABELS[level]}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Explanation Depth */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">説明の深さ</h3>
        <div className="flex gap-3">
          {DEPTHS.map((depth) => (
            <button
              key={depth}
              onClick={() => setExplanationDepth(depth)}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                explanationDepth === depth
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {DEPTH_LABELS[depth]}
            </button>
          ))}
        </div>
      </section>

      {/* Slide Count Range */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          スライド枚数: {slideCountRange[0]} - {slideCountRange[1]} 枚
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">最小</label>
            <input
              type="range"
              min={5}
              max={slideCountRange[1] - 1}
              value={slideCountRange[0]}
              onChange={(e) =>
                setSlideCountRange([Number(e.target.value), slideCountRange[1]])
              }
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">最大</label>
            <input
              type="range"
              min={slideCountRange[0] + 1}
              max={40}
              value={slideCountRange[1]}
              onChange={(e) =>
                setSlideCountRange([slideCountRange[0], Number(e.target.value)])
              }
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </section>

      {/* Max Bullets */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          箇条書き上限: {profile.max_bullets_per_slide} 個
        </h3>
        <input
          type="range"
          min={2}
          max={8}
          value={profile.max_bullets_per_slide}
          onChange={(e) =>
            setProfile({ max_bullets_per_slide: Number(e.target.value) })
          }
          className="w-full accent-blue-600"
        />
      </section>

      {/* Custom Instructions */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          追加指示（任意）
        </h3>
        <textarea
          value={profile.custom_instructions}
          onChange={(e) => setProfile({ custom_instructions: e.target.value })}
          placeholder="例: 「臨床例を多く含める」「数式を使って説明」"
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Sparkles className="w-5 h-5" />
          スライドを生成
        </button>
      </div>
    </div>
  );
}
