import { create } from 'zustand';
import type { PresentationPlan } from '../schemas';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  planSnapshot?: PresentationPlan;
}

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setProcessing: (v: boolean) => void;
  clearMessages: () => void;
}

let messageCounter = 0;

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isProcessing: false,

  addMessage: (msg) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${messageCounter++}`,
      timestamp: Date.now(),
    };
    set({ messages: [...get().messages, newMsg] });
  },

  setProcessing: (v) => set({ isProcessing: v }),
  clearMessages: () => set({ messages: [] }),
}));
