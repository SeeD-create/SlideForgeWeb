import { Loader2 } from 'lucide-react';

interface ProgressOverlayProps {
  stage: string;
  percent: number;
}

export function ProgressOverlay({ stage, percent }: ProgressOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
      <p className="text-lg font-medium text-gray-800 mb-4">{stage}</p>
      <div className="w-80 bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">{Math.round(percent)}%</p>
    </div>
  );
}
