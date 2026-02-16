import { create } from 'zustand';

/**
 * APIキーの取得方法:
 * - 開発時: VITE_ プレフィックス付き環境変数からビルド時に埋め込み（Vite proxy 用）
 * - 本番時: Netlify Functions がサーバーサイドでキーを注入するため不要
 *          （空文字列でOK。フロントからキーを送らない）
 */
const DEV_ANTHROPIC_KEY = import.meta.env.DEV ? (import.meta.env.VITE_ANTHROPIC_API_KEY || '') : '';
const DEV_GEMINI_KEY = import.meta.env.DEV ? (import.meta.env.VITE_GEMINI_API_KEY || '') : '';

interface GenerationProgress {
  stage: string;
  percent: number;
}

interface AppState {
  currentStep: number;
  maxReachedStep: number;
  anthropicApiKey: string;
  geminiApiKey: string;
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  error: string | null;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setGenerating: (loading: boolean) => void;
  setProgress: (progress: GenerationProgress | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
    currentStep: 1,
    maxReachedStep: 1,
    anthropicApiKey: DEV_ANTHROPIC_KEY,
    geminiApiKey: DEV_GEMINI_KEY,
    isGenerating: false,
    generationProgress: null,
    error: null,

    setStep: (step) =>
      set({
        currentStep: step,
        maxReachedStep: Math.max(get().maxReachedStep, step),
      }),
    nextStep: () => {
      const next = Math.min(get().currentStep + 1, 6);
      set({
        currentStep: next,
        maxReachedStep: Math.max(get().maxReachedStep, next),
      });
    },
    prevStep: () =>
      set({ currentStep: Math.max(get().currentStep - 1, 1) }),
    setGenerating: (loading) => set({ isGenerating: loading }),
    setProgress: (progress) => set({ generationProgress: progress }),
    setError: (error) => set({ error }),
    reset: () =>
      set({
        currentStep: 1,
        maxReachedStep: 1,
        isGenerating: false,
        generationProgress: null,
        error: null,
      }),
  })
);
