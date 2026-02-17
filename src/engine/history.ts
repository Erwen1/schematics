/* ──────────────────────────────────────────────
   History Manager — Undo / Redo engine
   ────────────────────────────────────────────── */

import { HistoryEntry } from '../data/types';

function deepClone(entry: HistoryEntry): HistoryEntry {
    return JSON.parse(JSON.stringify(entry));
}

export class HistoryManager {
    private undoStack: HistoryEntry[] = [];
    private redoStack: HistoryEntry[] = [];
    private readonly MAX_HISTORY = 100;

    push(entry: HistoryEntry) {
        this.undoStack.push(deepClone(entry));
        if (this.undoStack.length > this.MAX_HISTORY) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo(current: HistoryEntry): HistoryEntry | null {
        if (this.undoStack.length === 0) return null;
        this.redoStack.push(deepClone(current));
        return this.undoStack.pop()!;
    }

    redo(current: HistoryEntry): HistoryEntry | null {
        if (this.redoStack.length === 0) return null;
        this.undoStack.push(deepClone(current));
        return this.redoStack.pop()!;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
