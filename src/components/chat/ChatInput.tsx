import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  /** 対象スライドのラベル（例: "#3"）。undefined = 全体対象 */
  targetLabel?: string;
}

export function ChatInput({ onSend, disabled, targetLabel }: Props) {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 flex gap-2 items-center">
      <div className="flex-1 flex items-center gap-1.5 border border-gray-300 rounded-lg px-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {targetLabel && (
          <span className="shrink-0 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
            {targetLabel}
          </span>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={targetLabel ? `${targetLabel} への修正指示...` : '修正指示を入力...'}
          className="flex-1 py-2 text-sm outline-none bg-transparent disabled:opacity-50"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
