import type { ChatMessage as ChatMessageType } from '../../store';
import { cn } from '../../lib/cn';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser && 'bg-blue-600 text-white',
          !isUser && !isSystem && 'bg-gray-100 text-gray-800',
          isSystem && 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
