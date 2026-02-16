import { create } from 'zustand';

/**
 * APIキーは環境変数（ビルド時埋め込み）から取得。
 * ユーザーによるキー入力は不要。
 */
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

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
    anthropicApiKey: ANTHROPIC_API_KEY,
    geminiApiKey: GEMINI_API_KEY,
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
