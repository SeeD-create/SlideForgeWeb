import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, usePlanStore, useProfileStore } from '../../store';
import { SlidePreview } from '../slides/SlidePreview';
import { PptxBuilder } from '../../services/pptx-builder';
import { saveAs } from 'file-saver';
import { Download, FileJson, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';

export function Step6Export() {
  const navigate = useNavigate();
  const { setStep } = useAppStore();
  const { plan, generatedImages, reset: resetPlan } = usePlanStore();
  const { profile } = useProfileStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        スライドが生成されていません
      </div>
    );
  }

  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      const builder = new PptxBuilder(plan, profile, generatedImages);
      const blob = await builder.build();
      const filename = `${plan.lecture_title || plan.paper_title || 'presentation'}.pptx`;
      saveAs(blob, filename);
      setExported(true);
    } catch (e) {
      console.error('PPTX export failed:', e);
      alert(`エクスポートエラー: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const data = {
      version: '1.0.0',
      saved_at: new Date().toISOString(),
      plan,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${plan.lecture_title || 'plan'}.json`);
  };

  const handleStartOver = () => {
    resetPlan();
    setStep(1);
    navigate('/theme');
  };

  // Layout statistics
  const layoutCounts: Record<string, number> = {};
  for (const s of plan.slides) {
    layoutCounts[s.layout_type] = (layoutCounts[s.layout_type] || 0) + 1;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Download className="w-6 h-6" />
          エクスポート
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          スライドを PPTX ファイルとしてダウンロードできます
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-3">サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {plan.total_slides}
            </p>
            <p className="text-xs text-gray-500">スライド数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {Object.keys(generatedImages).length}
            </p>
            <p className="text-xs text-gray-500">AI 画像</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {plan.slides.filter((s) => s.diagram).length}
            </p>
            <p className="text-xs text-gray-500">図表</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {plan.slides.filter((s) => s.table).length}
            </p>
            <p className="text-xs text-gray-500">テーブル</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(layoutCounts).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
            >
              {type}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          全スライド一覧
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {plan.slides.map((slide) => (
            <div
              key={slide.slide_number}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-video">
                <SlidePreview
                  slide={slide}
                  profile={profile}
                  totalSlides={plan.total_slides}
                  imageData={generatedImages[slide.slide_number]}
                />
              </div>
              <div className="px-2 py-1 text-[10px] text-gray-400 truncate bg-white">
                #{slide.slide_number} {slide.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-medium">フォントについて</p>
        <p className="mt-1 text-xs text-yellow-600">
          PPTX ファイルでは「{profile.fonts.japanese}」フォントを使用します。
          正しく表示するには、ファイルを開く PC にこのフォントがインストールされている必要があります。
        </p>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button
          onClick={handleExportPptx}
          disabled={isExporting}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : exported ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isExporting
            ? '生成中...'
            : exported
            ? 'ダウンロード済み'
            : 'PPTX ダウンロード'}
        </button>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <FileJson className="w-5 h-5" />
          Plan JSON 保存
        </button>
        <button
          onClick={handleStartOver}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors ml-auto"
        >
          <RotateCcw className="w-5 h-5" />
          最初からやり直す
        </button>
      </div>
    </div>
  );
}
