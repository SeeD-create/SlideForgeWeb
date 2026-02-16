import { useAppStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Check, Palette, FileText, Settings, Sparkles, MessageSquare, Download } from 'lucide-react';
import { cn } from '../../lib/cn';

const STEPS = [
  { number: 1, label: 'テーマ選択', path: '/theme', Icon: Palette },
  { number: 2, label: '入力', path: '/input', Icon: FileText },
  { number: 3, label: '設定', path: '/config', Icon: Settings },
  { number: 4, label: '生成', path: '/generate', Icon: Sparkles },
  { number: 5, label: '修正', path: '/refine', Icon: MessageSquare },
  { number: 6, label: 'エクスポート', path: '/export', Icon: Download },
];

export function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);
  const maxReachedStep = useAppStore((s) => s.maxReachedStep);
  const setStep = useAppStore((s) => s.setStep);
  const navigate = useNavigate();

  const handleClick = (step: typeof STEPS[number]) => {
    if (step.number <= maxReachedStep) {
      setStep(step.number);
      navigate(step.path);
    }
  };

  return (
    <nav className="w-52 bg-gray-50 border-r border-gray-200 py-6 px-4 shrink-0">
      <div className="space-y-1">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isReachable = step.number <= maxReachedStep;

          return (
            <button
              key={step.number}
              onClick={() => handleClick(step)}
              disabled={!isReachable}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                isActive && 'bg-blue-50 text-blue-700 font-semibold',
                isCompleted && !isActive && 'text-green-700 hover:bg-green-50',
                !isActive && !isCompleted && isReachable && 'text-gray-600 hover:bg-gray-100',
                !isReachable && 'text-gray-300 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  isActive && 'bg-blue-700 text-white',
                  isCompleted && !isActive && 'bg-green-600 text-white',
                  !isActive && !isCompleted && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
