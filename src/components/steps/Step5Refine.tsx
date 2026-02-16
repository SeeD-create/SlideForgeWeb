import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, usePlanStore, useProfileStore, useChatStore } from '../../store';
import { SlideCarousel } from '../slides/SlideCarousel';
import { SlideList } from '../slides/SlideList';
import { ChatPanel } from '../chat/ChatPanel';
import { AnthropicClient } from '../../services/anthropic';
import { PlanRefiner } from '../../services/structurer';
import { ArrowRight, Undo2, Redo2, MessageSquare } from 'lucide-react';

export function Step5Refine() {
  const navigate = useNavigate();
  const { anthropicApiKey, setStep } = useAppStore();
  const { profile } = useProfileStore();
  const {
    plan,
    setPlan,
    selectedSlideIndex,
    setSelectedSlideIndex,
    generatedImages,
    pushHistory,
    undo,
    redo,
    history,
    historyIndex,
  } = usePlanStore();
  const { addMessage, setProcessing } = useChatStore();

  // displayIndex: カルーセルとサムネイル用（常に 0 以上）
  // selectedSlideIndex: チャット対象用（-1 = 全体、0+ = 特定スライド）
  const [displayIndex, setDisplayIndex] = useState(
    selectedSlideIndex >= 0 ? selectedSlideIndex : 0
  );

  // selectedSlideIndex が変わったら displayIndex も更新（-1以外の場合）
  useEffect(() => {
    if (selectedSlideIndex >= 0) {
      setDisplayIndex(selectedSlideIndex);
    }
  }, [selectedSlideIndex]);

  // サムネイルやカルーセルからの選択 → 両方更新
  const handleSlideSelect = useCallback(
    (index: number) => {
      setDisplayIndex(index);
      setSelectedSlideIndex(index);
    },
    [setSelectedSlideIndex]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
      if (e.key === 'ArrowLeft' && !e.ctrlKey) {
        const newIdx = Math.max(0, displayIndex - 1);
        handleSlideSelect(newIdx);
      }
      if (e.key === 'ArrowRight' && !e.ctrlKey && plan) {
        const newIdx = Math.min(plan.slides.length - 1, displayIndex + 1);
        handleSlideSelect(newIdx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, displayIndex, handleSlideSelect, plan]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!plan) return;

      addMessage({ role: 'user', content: message });
      setProcessing(true);
      pushHistory();

      try {
        const client = new AnthropicClient(anthropicApiKey);
        const refiner = new PlanRefiner(client);
        const updatedPlan = await refiner.refinePlan(plan, message);
        setPlan(updatedPlan);
        addMessage({
          role: 'assistant',
          content: `修正完了: ${updatedPlan.total_slides} 枚のスライドに更新しました。`,
          planSnapshot: updatedPlan,
        });
      } catch (e) {
        addMessage({
          role: 'system',
          content: `エラー: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      } finally {
        setProcessing(false);
      }
    },
    [plan, anthropicApiKey, addMessage, setProcessing, pushHistory, setPlan]
  );

  const handleNext = () => {
    setStep(6);
    navigate('/export');
  };

  if (!plan || !plan.slides || plan.slides.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">スライドが生成されていません</p>
          <button
            onClick={() => { setStep(4); navigate('/generate'); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            生成画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">スライド修正</h2>
          <span className="text-sm text-gray-400">
            {plan.total_slides} 枚
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="元に戻す (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="やり直し (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            エクスポート
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: Slide thumbnails */}
        <div className="w-48 shrink-0 overflow-y-auto">
          <SlideList
            slides={plan.slides}
            profile={profile}
            selectedIndex={displayIndex}
            onSelect={handleSlideSelect}
            generatedImages={generatedImages}
          />
        </div>

        {/* Center: Main slide view */}
        <div className="flex-1 flex items-start justify-center overflow-auto">
          <div className="w-full max-w-3xl">
            <SlideCarousel
              slides={plan.slides}
              profile={profile}
              currentIndex={displayIndex}
              onIndexChange={handleSlideSelect}
              generatedImages={generatedImages}
            />
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="w-80 shrink-0 flex flex-col">
          <ChatPanel onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
