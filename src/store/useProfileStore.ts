import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LecturerProfile } from '../schemas';

const DEFAULT_PROFILE: LecturerProfile = {
  name: 'default',
  display_name: '',
  affiliation: '',
  fonts: {
    japanese: '游ゴシック',
    latin: 'Calibri',
    title_size_pt: 32,
    subtitle_size_pt: 24,
    body_size_pt: 18,
    caption_size_pt: 14,
  },
  colors: {
    primary: '#2B579A',
    secondary: '#217346',
    accent: '#B7472A',
    background: '#FFFFFF',
    text_dark: '#333333',
    text_light: '#666666',
  },
  default_audience: 'grad_student',
  explanation_depth: 'standard',
  max_bullets_per_slide: 5,
  prefer_diagrams: true,
  custom_instructions: '',
  language: 'ja',
};

const PRESETS: LecturerProfile[] = [
  { ...DEFAULT_PROFILE, name: 'academic-blue', display_name: 'Academic Blue' },
  {
    ...DEFAULT_PROFILE,
    name: 'forest-green',
    display_name: 'Forest Green',
    colors: {
      primary: '#2D5F2D',
      secondary: '#4A8C4A',
      accent: '#D4A843',
      background: '#FFFFFF',
      text_dark: '#2C2C2C',
      text_light: '#5A5A5A',
    },
  },
  {
    ...DEFAULT_PROFILE,
    name: 'warm-earth',
    display_name: 'Warm Earth',
    colors: {
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#D2691E',
      background: '#FFFAF0',
      text_dark: '#3E2723',
      text_light: '#795548',
    },
  },
  {
    ...DEFAULT_PROFILE,
    name: 'modern-minimal',
    display_name: 'Modern Minimal',
    colors: {
      primary: '#1A1A2E',
      secondary: '#16213E',
      accent: '#E94560',
      background: '#FFFFFF',
      text_dark: '#1A1A2E',
      text_light: '#6C757D',
    },
  },
  {
    ...DEFAULT_PROFILE,
    name: 'ocean-breeze',
    display_name: 'Ocean Breeze',
    colors: {
      primary: '#006994',
      secondary: '#00A9CE',
      accent: '#FF6B35',
      background: '#FFFFFF',
      text_dark: '#2C3E50',
      text_light: '#7F8C8D',
    },
  },
];

interface ProfileState {
  profile: LecturerProfile;
  presets: LecturerProfile[];

  setProfile: (updates: Partial<LecturerProfile>) => void;
  setFonts: (fonts: Partial<LecturerProfile['fonts']>) => void;
  setColors: (colors: Partial<LecturerProfile['colors']>) => void;
  loadPreset: (presetName: string) => void;
  resetToDefault: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: { ...DEFAULT_PROFILE },
      presets: PRESETS,

      setProfile: (updates) =>
        set({ profile: { ...get().profile, ...updates } }),
      setFonts: (fonts) =>
        set({
          profile: {
            ...get().profile,
            fonts: { ...get().profile.fonts, ...fonts },
          },
        }),
      setColors: (colors) =>
        set({
          profile: {
            ...get().profile,
            colors: { ...get().profile.colors, ...colors },
          },
        }),
      loadPreset: (presetName) => {
        const preset = get().presets.find((p) => p.name === presetName);
        if (preset) {
          set({ profile: { ...preset } });
        }
      },
      resetToDefault: () => set({ profile: { ...DEFAULT_PROFILE } }),
    }),
    {
      name: 'slideforge-profile',
    }
  )
);
