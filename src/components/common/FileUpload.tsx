import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMb?: number;
  currentFile?: File | null;
  onClear?: () => void;
}

export function FileUpload({
  onFileSelect,
  accept = '.pdf',
  maxSizeMb = 50,
  currentFile,
  onClear,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.size <= maxSizeMb * 1024 * 1024) {
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSizeMb]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <FileText className="w-8 h-8 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900 truncate">{currentFile.name}</p>
          <p className="text-xs text-blue-600">
            {(currentFile.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        {onClear && (
          <button onClick={onClear} className="p-1 hover:bg-blue-100 rounded">
            <X className="w-4 h-4 text-blue-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">
          PDF ファイルをドラッグ&ドロップ
        </p>
        <p className="text-xs text-gray-400 mt-1">
          またはクリックして選択（最大 {maxSizeMb}MB）
        </p>
      </label>
    </div>
  );
}
