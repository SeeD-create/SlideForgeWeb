import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, usePlanStore } from '../../store';
import { FileUpload } from '../common/FileUpload';
import { parsePdf } from '../../services/pdf-parser';
import { ArrowLeft, ArrowRight, FileText, Loader2 } from 'lucide-react';

export function Step2Input() {
  const navigate = useNavigate();
  const { setStep } = useAppStore();
  const { inputText, setInputText, parsedDocument, setParsedDocument, pdfFile, setPdfFile } =
    usePlanStore();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  // Guard against undefined inputText
  const safeText = inputText ?? '';
  const canProceed = safeText.trim().length > 0 || parsedDocument !== null;

  const handleFileSelect = useCallback(
    async (file: File) => {
      setPdfFile(file);
      setIsExtracting(true);
      setExtractProgress(0);
      try {
        const doc = await parsePdf(file, (p) => setExtractProgress(p));
        setParsedDocument(doc);
        // Also set the markdown text for fallback
        if (!inputText) {
          setInputText((doc.full_markdown ?? '').substring(0, 500) + '...');
        }
      } catch (e) {
        console.error('PDF extraction failed:', e);
      } finally {
        setIsExtracting(false);
      }
    },
    [setPdfFile, setParsedDocument, setInputText, inputText]
  );

  const handleBack = () => {
    setStep(1);
    navigate('/theme');
  };

  const handleNext = () => {
    // If no parsed document but text, create a simple doc
    if (!parsedDocument && safeText.trim()) {
      setParsedDocument({
        title: safeText.trim().substring(0, 80),
        authors: [],
        abstract: '',
        sections: [],
        figures: [],
        full_markdown: safeText,
        source_type: 'text',
        total_pages: 0,
      });
    }
    setStep(3);
    navigate('/config');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          入力
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          スライドの元になるテキストや PDF ファイルを入力してください
        </p>
      </div>

      {/* PDF Upload */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">PDF アップロード</h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          currentFile={pdfFile}
          onClear={() => {
            setPdfFile(null);
            setParsedDocument(null);
          }}
        />
        {isExtracting && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            PDF を解析中... {Math.round(extractProgress)}%
          </div>
        )}
        {parsedDocument && !isExtracting && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="font-medium text-green-800">
              解析完了: {parsedDocument.title}
            </p>
            <p className="text-green-600 mt-1">
              {parsedDocument.total_pages} ページ &middot;{' '}
              {parsedDocument.figures.length} 図表 &middot;{' '}
              {parsedDocument.sections.length} セクション
            </p>
          </div>
        )}
      </section>

      {/* Text Input */}
      <section>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          テキスト入力（または講義トピック）
        </h3>
        <textarea
          value={safeText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="講義の内容やトピックを入力してください。論文のテキスト、Markdown、または「薬物動態学の基礎」のようなトピック名でも構いません。"
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {safeText.length.toLocaleString()} 文字
        </p>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </button>
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
