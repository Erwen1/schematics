/* ──────────────────────────────────────────────
   AI Store — Intelligence & Design Advisory State
   ────────────────────────────────────────────── */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { DesignHint, ProjectAdvice, HintCategory } from '../data/types';

export interface AiState {
    // Advisor State
    advice: ProjectAdvice;
    isCalculating: boolean;

    // Prompt State
    promptHistory: string[];
    lastResponse: string | null;

    // Actions
    addHint: (hint: Omit<DesignHint, 'id'>) => void;
    removeHint: (id: string) => void;
    clearHints: (category?: HintCategory) => void;
    setAdvice: (advice: ProjectAdvice) => void;
    setCalculating: (val: boolean) => void;

    addPrompt: (prompt: string) => void;
    setResponse: (response: string) => void;

    // Optimization
    updateScore: (score: number) => void;
}

export const useAiStore = create<AiState>((set) => ({
    advice: {
        hints: [],
        score: 100,
        lastUpdated: Date.now()
    },
    isCalculating: false,
    promptHistory: [],
    lastResponse: null,

    addHint: (hint) => set((s) => ({
        advice: {
            ...s.advice,
            hints: [...s.advice.hints, { ...hint, id: uuid() }],
            lastUpdated: Date.now()
        }
    })),

    removeHint: (id) => set((s) => ({
        advice: {
            ...s.advice,
            hints: s.advice.hints.filter(h => h.id !== id),
            lastUpdated: Date.now()
        }
    })),

    clearHints: (category) => set((s) => ({
        advice: {
            ...s.advice,
            hints: category
                ? s.advice.hints.filter(h => h.category !== category)
                : [],
            lastUpdated: Date.now()
        }
    })),

    setAdvice: (advice) => set({ advice }),

    setCalculating: (isCalculating) => set({ isCalculating }),

    addPrompt: (prompt) => set((s) => ({
        promptHistory: [prompt, ...s.promptHistory].slice(0, 50)
    })),

    setResponse: (lastResponse) => set({ lastResponse }),

    updateScore: (score) => set((s) => ({
        advice: { ...s.advice, score, lastUpdated: Date.now() }
    }))
}));
