import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PresentationPlan, SlideContent, ParsedDocument, AudienceLevel } from '../schemas';

interface PlanState {
  inputText: string;
  parsedDocument: ParsedDocument | null;
  pdfFile: File | null;
  audienceLevel: AudienceLevel;
  explanationDepth: 'brief' | 'standard' | 'detailed';
  slideCountRange: [number, number];
  plan: PresentationPlan | null;
  generatedImages: Record<number, string>;
  history: PresentationPlan[];
  historyIndex: number;
  selectedSlideIndex: number;

  setInputText: (text: string) => void;
  setParsedDocument: (doc: ParsedDocument | null) => void;
  setPdfFile: (file: File | null) => void;
  setAudienceLevel: (level: AudienceLevel) => void;
  setExplanationDepth: (depth: 'brief' | 'standard' | 'detailed') => void;
  setSlideCountRange: (range: [number, number]) => void;
  setPlan: (plan: PresentationPlan) => void;
  updateSlide: (index: number, updates: Partial<SlideContent>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  deleteSlide: (index: number) => void;
  addSlide: (afterIndex: number, slide: SlideContent) => void;
  addGeneratedImage: (slideNumber: number, dataUrl: string) => void;
  setSelectedSlideIndex: (index: number) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const MAX_HISTORY = 20;

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      inputText: '',
      parsedDocument: null,
      pdfFile: null,
      audienceLevel: 'grad_student',
      explanationDepth: 'standard',
      slideCountRange: [15, 25],
      plan: null,
      generatedImages: {},
      history: [],
      historyIndex: -1,
      selectedSlideIndex: 0,

      setInputText: (text) => set({ inputText: text }),
      setParsedDocument: (doc) => set({ parsedDocument: doc }),
      setPdfFile: (file) => set({ pdfFile: file }),
      setAudienceLevel: (level) => set({ audienceLevel: level }),
      setExplanationDepth: (depth) => set({ explanationDepth: depth }),
      setSlideCountRange: (range) => set({ slideCountRange: range }),
      setSelectedSlideIndex: (index) => set({ selectedSlideIndex: index }),

      setPlan: (plan) => {
        console.log('[PlanStore] setPlan called:', plan ? `${plan.slides?.length} slides` : 'null');
        set({ plan });
      },

      updateSlide: (index, updates) => {
        const { plan } = get();
        if (!plan) return;
        const slides = [...plan.slides];
        slides[index] = { ...slides[index], ...updates };
        set({ plan: { ...plan, slides } });
      },

      reorderSlides: (fromIndex, toIndex) => {
        const { plan } = get();
        if (!plan) return;
        const slides = [...plan.slides];
        const [moved] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, moved);
        slides.forEach((s, i) => (s.slide_number = i + 1));
        set({ plan: { ...plan, slides, total_slides: slides.length } });
      },

      deleteSlide: (index) => {
        const { plan } = get();
        if (!plan) return;
        const slides = plan.slides.filter((_, i) => i !== index);
        slides.forEach((s, i) => (s.slide_number = i + 1));
        set({ plan: { ...plan, slides, total_slides: slides.length } });
      },

      addSlide: (afterIndex, slide) => {
        const { plan } = get();
        if (!plan) return;
        const slides = [...plan.slides];
        slides.splice(afterIndex + 1, 0, slide);
        slides.forEach((s, i) => (s.slide_number = i + 1));
        set({ plan: { ...plan, slides, total_slides: slides.length } });
      },

      addGeneratedImage: (slideNumber, dataUrl) =>
        set({ generatedImages: { ...get().generatedImages, [slideNumber]: dataUrl } }),

      pushHistory: () => {
        const { plan, history, historyIndex } = get();
        if (!plan) return;
        const snapshot = JSON.parse(JSON.stringify(plan)) as PresentationPlan;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(snapshot);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        set({
          plan: JSON.parse(JSON.stringify(history[newIndex])),
          historyIndex: newIndex,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        set({
          plan: JSON.parse(JSON.stringify(history[newIndex])),
          historyIndex: newIndex,
        });
      },

      reset: () =>
        set({
          inputText: '',
          parsedDocument: null,
          pdfFile: null,
          plan: null,
          generatedImages: {},
          history: [],
          historyIndex: -1,
          selectedSlideIndex: 0,
        }),
    }),
    {
      name: 'slideforge-plan',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist serializable and important fields
      partialize: (state) => ({
        inputText: state.inputText,
        parsedDocument: state.parsedDocument,
        audienceLevel: state.audienceLevel,
        explanationDepth: state.explanationDepth,
        slideCountRange: state.slideCountRange,
        plan: state.plan,
        // Don't persist: pdfFile (not serializable), generatedImages (too large for sessionStorage),
        // history (too large), historyIndex, selectedSlideIndex
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<PlanState> | undefined;
        return {
          ...current,
          inputText: p?.inputText ?? current.inputText,
          parsedDocument: p?.parsedDocument ?? current.parsedDocument,
          audienceLevel: p?.audienceLevel ?? current.audienceLevel,
          explanationDepth: p?.explanationDepth ?? current.explanationDepth,
          slideCountRange: p?.slideCountRange ?? current.slideCountRange,
          plan: p?.plan ?? current.plan,
        };
      },
    }
  )
);
