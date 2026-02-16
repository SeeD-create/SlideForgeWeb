import { useNavigate } from 'react-router-dom';
import { useAppStore, useProfileStore } from '../../store';
import { ThemePresetCard } from '../theme/ThemePresetCard';
import { ColorPicker } from '../theme/ColorPicker';
import { FontSelector } from '../theme/FontSelector';
import { ThemePreview } from '../theme/ThemePreview';
import { ApiKeyInput } from '../common/ApiKeyInput';
import { ArrowRight, Palette } from 'lucide-react';
import type { ColorScheme, FontConfig } from '../../schemas';

export function Step1Theme() {
  const navigate = useNavigate();
  const { anthropicApiKey, geminiApiKey, setApiKey, setStep } = useAppStore();
  const { profile, presets, loadPreset, setColors, setFonts } = useProfileStore();

  const canProceed = !!anthropicApiKey;

  const handleNext = () => {
    setStep(2);
    navigate('/input');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Palette className="w-6 h-6" />
          テーマ選択
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          スライドのデザインテーマを選択してください
        </p>
      </div>

      {/* Theme Presets */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          プリセット
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {presets.map((preset) => (
            <ThemePresetCard
              key={preset.name}
              preset={preset}
              isSelected={profile.name === preset.name}
              onClick={() => loadPreset(preset.name)}
            />
          ))}
        </div>
      </section>

      {/* Custom Theme */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              カラー設定
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <ColorPicker
                colors={profile.colors}
                onChange={(key: keyof ColorScheme, value: string) => setColors({ [key]: value })}
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              フォント設定
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <FontSelector
                fonts={profile.fonts}
                onChange={(key: keyof FontConfig, value: string | number) =>
                  setFonts({ [key]: value } as Partial<FontConfig>)
                }
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            プレビュー
          </h3>
          <ThemePreview profile={profile} />
        </div>
      </section>

      {/* API Keys */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          API キー設定
        </h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ApiKeyInput
            label="Anthropic API Key (必須)"
            value={anthropicApiKey}
            onChange={(v) => setApiKey('anthropic', v)}
            placeholder="sk-ant-..."
          />
          <ApiKeyInput
            label="Gemini API Key (画像生成用・任意)"
            value={geminiApiKey}
            onChange={(v) => setApiKey('gemini', v)}
            placeholder="AIzaSy..."
          />
        </div>
      </section>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          次へ
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
