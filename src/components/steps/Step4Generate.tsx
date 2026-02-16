import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, usePlanStore, useProfileStore } from '../../store';
import { ProgressOverlay } from '../common/ProgressOverlay';
import { AnthropicClient } from '../../services/anthropic';
import { ContentStructurer } from '../../services/structurer';
import { ImageGenerator } from '../../services/gemini-imagen';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ParsedDocument } from '../../schemas';

export function Step4Generate() {
  const navigate = useNavigate();
  const started = useRef(false);
  const {
    anthropicApiKey,
    geminiApiKey,
    error,
    setGenerating,
    setProgress,
    setError,
    setStep,
  } = useAppStore();
  const {
    parsedDocument,
    inputText,
    audienceLevel,
    setPlan,
    addGeneratedImage,
    pushHistory,
  } = usePlanStore();
  const { profile } = useProfileStore();

  const [stage, setStage] = useState('準備中...');
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runGeneration() {
    setGenerating(true);
    setError(null);

    try {
      // Build document from input
      setStage('入力を準備中...');
      setPercent(5);
      const text = inputText || '';
      if (!parsedDocument && !text.trim()) {
        throw new Error('入力テキストがありません。Step 2 でテキストを入力してください。');
      }
      const doc: ParsedDocument = parsedDocument ?? {
        title: text.substring(0, 80) || '無題',
        authors: [],
        abstract: '',
        sections: [],
        figures: [],
        full_markdown: text,
        source_type: 'text',
        total_pages: 0,
      };

      // Call Claude for structuring
      setStage('Claude API でスライド構成を生成中...');
      setPercent(15);
      const client = new AnthropicClient(anthropicApiKey);
      const structurer = new ContentStructurer(client, profile);
      let plan = await structurer.structureDocument(doc, audienceLevel);

      setStage('バリデーション完了');
      setPercent(65);

      // Generate images if Gemini key provided
      if (geminiApiKey) {
        const eligibleCount = plan.slides.filter(
          (s) => s.image_prompt && !s.image_ref
        ).length;

        if (eligibleCount > 0) {
          setStage('AI 画像を生成中...');
          setPercent(70);
          try {
            const imgGen = new ImageGenerator(geminiApiKey);
            const { updatedPlan, images } = await imgGen.generateForPlan(
              plan,
              (current, total) => {
                setStage(`画像生成中 (${current}/${total})...`);
                setPercent(70 + (current / total) * 25);
              }
            );
            plan = updatedPlan;

            // Store generated images
            for (const [slideNum, dataUrl] of Object.entries(images)) {
              addGeneratedImage(Number(slideNum), dataUrl);
            }
          } catch (imgError) {
            console.warn('画像生成をスキップ:', imgError);
            // Image generation failure is non-fatal
          }
        }
      }

      const slideCount = plan.slides?.length ?? 0;
      console.log('[Step4] Plan generated:', slideCount, 'slides');
      if (slideCount > 0) {
        console.log('[Step4] First slide:', JSON.stringify(plan.slides[0]).substring(0, 200));
      } else {
        console.warn('[Step4] WARNING: Plan has no slides!', JSON.stringify(plan).substring(0, 500));
      }

      setStage(`スライド生成完了! (${slideCount} 枚)`);
      setPercent(100);
      setPlan(plan);
      pushHistory();

      // Verify plan was stored
      const storedPlan = usePlanStore.getState().plan;
      console.log('[Step4] Plan in store:', storedPlan ? `${storedPlan.slides.length} slides` : 'NULL');

      if (slideCount === 0) {
        throw new Error('スライドが0枚です。Claude APIの応答にスライドデータが含まれていませんでした。\n\nRaw response: ' + JSON.stringify(plan).substring(0, 300));
      }

      setCompleted(true);
      setGenerating(false);

      // Auto-advance to Step 5 after showing success
      setTimeout(() => {
        const planCheck = usePlanStore.getState().plan;
        console.log('[Step4] Plan before navigate:', planCheck ? `${planCheck.slides.length} slides` : 'NULL');
        setStep(5);
        navigate('/refine');
      }, 2000);
    } catch (e) {
      console.error('Generation error:', e);
      const errMsg = e instanceof Error
        ? `${e.message}\n\nStack: ${e.stack}`
        : 'Generation failed';
      setError(errMsg);
      setGenerating(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            生成エラー
          </h3>
          <pre className="text-xs text-red-600 mb-4 text-left whitespace-pre-wrap max-h-60 overflow-auto bg-red-100 p-3 rounded">{error}</pre>
          <button
            onClick={() => {
              started.current = false;
              setError(null);
              setCompleted(false);
              runGeneration();
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            リトライ
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">
            スライド生成完了!
          </h3>
          <p className="text-sm text-green-600 mb-4">
            {usePlanStore.getState().plan?.slides?.length ?? 0} 枚のスライドを生成しました。修正画面に移動しています...
          </p>
          <button
            onClick={() => { setStep(5); navigate('/refine'); }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            修正画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-20">
      <ProgressOverlay stage={stage} percent={percent} />
    </div>
  );
}
