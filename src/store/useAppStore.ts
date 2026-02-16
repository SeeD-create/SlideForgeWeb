import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setApiKey: (provider: 'anthropic' | 'gemini', key: string) => void;
  setGenerating: (loading: boolean) => void;
  setProgress: (progress: GenerationProgress | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      maxReachedStep: 1,
      anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
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
      setApiKey: (provider, key) =>
        set(
          provider === 'anthropic'
            ? { anthropicApiKey: key }
            : { geminiApiKey: key }
        ),
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
    }),
    {
      name: 'slideforge-app',
      partialize: (state) => ({
        anthropicApiKey: state.anthropicApiKey,
        geminiApiKey: state.geminiApiKey,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          anthropicApiKey: p?.anthropicApiKey || current.anthropicApiKey,
          geminiApiKey: p?.geminiApiKey || current.geminiApiKey,
        };
      },
    }
  )
);
