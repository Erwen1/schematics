/* ──────────────────────────────────────────────
   PCB Store — PCB Layout State Management
   ────────────────────────────────────────────── */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import {
    FootprintInstance, PcbTrace, PcbVia, BoardOutline,
    PcbLayer, PcbLayerDef, PcbToolMode, PcbViolation,
    SymbolInstance, Net, NetClass, TracePoint, PcbProject
} from '../data/types';
import { DEFAULT_LAYERS } from '../engine/layerStack';
import { getFootprintForSymbol } from '../data/footprintLibrary';
import { computeRatsnest, RatsnestLine } from '../engine/ratsnest';
import { runPcbDrc } from '../engine/drc';
import { snapTo45 } from '../engine/pcbRouter';
import { autoPlaceFootprints, autoFixConstraints } from '../engine/aiPcbEngine';

export interface PcbState {
    // Data
    footprints: FootprintInstance[];
    traces: PcbTrace[];
    vias: PcbVia[];
    outline: BoardOutline;
    layers: PcbLayerDef[];
    violations: PcbViolation[];
    ratsnest: RatsnestLine[];

    // UI / Tool State
    tool: PcbToolMode;
    activeLayer: PcbLayer;
    selectedIds: string[];
    traceInProgress: TracePoint[] | null;
    hoveredId: string | null;

    // Canvas
    stagePos: { x: number; y: number };
    stageScale: number;

    // Actions
    setTool: (tool: PcbToolMode) => void;
    setActiveLayer: (layer: PcbLayer) => void;
    toggleLayerVisibility: (layerId: PcbLayer) => void;

    // Footprints
    moveFootprint: (id: string, x: number, y: number) => void;
    rotateFootprint: (id: string) => void;

    // Routing
    startTrace: (p: TracePoint, netId?: string) => void;
    addTracePoint: (p: TracePoint) => void;
    finishTrace: () => void;
    cancelTrace: () => void;

    // Board
    drawOutline: (points: { x: number, y: number }[]) => void;

    // Integration
    importFromSchematic: (symbols: SymbolInstance[], nets: Net[], netClasses: NetClass[]) => void;
    runDrc: (nets: Net[], netClasses: NetClass[]) => void;
    performAutoPlace: () => void;
    performAutoDrc: (nets: Net[], netClasses: NetClass[]) => void;

    // Canvas Actions
    setStagePos: (pos: { x: number; y: number }) => void;
    setStageScale: (scale: number) => void;
}

export const usePcbStore = create<PcbState>((set, get) => ({
    footprints: [],
    traces: [],
    vias: [],
    outline: { points: [] },
    layers: DEFAULT_LAYERS,
    violations: [],
    ratsnest: [],

    tool: 'select',
    activeLayer: 'F.Cu',
    selectedIds: [],
    traceInProgress: null,
    hoveredId: null,

    stagePos: { x: 400, y: 300 },
    stageScale: 2, // Default zoom for PCB (units are mm)

    setTool: (tool) => set({ tool }),
    setActiveLayer: (layer) => set({ activeLayer: layer }),

    toggleLayerVisibility: (layerId) => set((s) => ({
        layers: s.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
    })),

    moveFootprint: (id, x, y) => set((s) => ({
        footprints: s.footprints.map(f => f.id === id ? { ...f, x, y } : f)
    })),

    rotateFootprint: (id) => set((s) => ({
        footprints: s.footprints.map(f => f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f)
    })),

    startTrace: (p, netId) => set({
        traceInProgress: [p],
        tool: 'route'
    }),

    addTracePoint: (p) => set((s) => {
        if (!s.traceInProgress) return s;
        const last = s.traceInProgress[s.traceInProgress.length - 1];
        const snapped = snapTo45(last, p);
        return { traceInProgress: [...s.traceInProgress, snapped] };
    }),

    finishTrace: () => set((s) => {
        if (!s.traceInProgress || s.traceInProgress.length < 2) return { traceInProgress: null };
        const newTrace: PcbTrace = {
            id: uuid(),
            points: s.traceInProgress,
            width: 0.25, // Fallback width
            layer: s.activeLayer
        };
        return {
            traces: [...s.traces, newTrace],
            traceInProgress: null
        };
    }),

    cancelTrace: () => set({ traceInProgress: null }),

    drawOutline: (points) => set({ outline: { points } }),

    importFromSchematic: (symbols, nets, netClasses) => set((s) => {
        const newFootprints: FootprintInstance[] = symbols.map((sym, idx) => {
            const fpDef = getFootprintForSymbol(sym.symbolRef);
            return {
                id: uuid(),
                footprintRef: fpDef?.id ?? 'fp_0805',
                componentRef: sym.properties.reference,
                schematicSymbolId: sym.id,
                x: 50 + (idx % 5) * 20, // Simple grid layout for import
                y: 50 + Math.floor(idx / 5) * 20,
                rotation: 0,
                flipped: false
            };
        });

        const rats = computeRatsnest(newFootprints, [], nets);

        return {
            footprints: newFootprints,
            traces: [],
            vias: [],
            ratsnest: rats,
            violations: []
        };
    }),

    runDrc: (nets, netClasses) => set((s) => {
        const violations = runPcbDrc(s as any, nets, netClasses);
        return { violations };
    }),

    performAutoPlace: () => set((s) => {
        const optimized = autoPlaceFootprints(s.footprints, s.ratsnest);
        // Re-calculate ratsnest for new positions
        const { nets } = (s as any); // Simplified for this store
        // In a real app we'd get current nets from schematicStore or similar
        return { footprints: optimized };
    }),

    performAutoDrc: (nets, netClasses) => set((s) => {
        const currentProject: PcbProject = {
            footprints: s.footprints,
            traces: s.traces,
            vias: s.vias,
            outline: s.outline,
            layers: s.layers,
            violations: s.violations
        };
        const fixedProject = autoFixConstraints(currentProject);
        return {
            footprints: fixedProject.footprints,
            violations: fixedProject.violations
        };
    }),

    setStagePos: (pos) => set({ stagePos: pos }),
    setStageScale: (scale) => set({ stageScale: scale }),
}));
