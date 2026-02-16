import { Presentation } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
      <Presentation className="w-6 h-6 text-blue-700 mr-2" />
      <h1 className="text-lg font-bold text-gray-800">SlideForge</h1>
      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Web</span>
    </header>
  );
}
