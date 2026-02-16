import { useCallback } from 'react';
import { useChatStore, usePlanStore } from '../../store';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SlideSelector } from './SlideSelector';

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const { messages, isProcessing } = useChatStore();
  const { plan, selectedSlideIndex, setSelectedSlideIndex } = usePlanStore();

  const totalSlides = plan?.slides?.length ?? 0;

  const handleSend = useCallback(
    (rawMessage: string) => {
      // selectedSlideIndex: -1 = 全体, 0+ = 特定スライド
      if (selectedSlideIndex >= 0) {
        const slideNum = selectedSlideIndex + 1;
        const slideTitle = plan?.slides?.[selectedSlideIndex]?.title;
        const prefix = slideTitle
          ? `スライド ${slideNum}「${slideTitle}」について: `
          : `スライド ${slideNum} について: `;
        onSendMessage(prefix + rawMessage);
      } else {
        onSendMessage(rawMessage);
      }
    },
    [onSendMessage, selectedSlideIndex, plan]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">チャット修正</h3>
        <p className="text-xs text-gray-400">修正指示を入力してください</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>例: 「箇条書きを簡潔にして」</p>
            <p className="mt-1">「まとめスライドを追加して」</p>
            <p className="mt-2 text-xs text-gray-300">下のボタンでスライドを指定できます</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>

      {/* Slide selector chips */}
      <SlideSelector
        totalSlides={totalSlides}
        selectedSlideIndex={selectedSlideIndex}
        onSelectSlide={setSelectedSlideIndex}
      />

      {/* Input with target indicator */}
      <ChatInput
        onSend={handleSend}
        disabled={isProcessing}
        targetLabel={
          selectedSlideIndex >= 0
            ? `#${selectedSlideIndex + 1}`
            : undefined
        }
      />
    </div>
  );
}
