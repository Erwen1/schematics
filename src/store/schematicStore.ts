/* ──────────────────────────────────────────────
   Zustand Store — Central state management
   ────────────────────────────────────────────── */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import {
    SymbolInstance,
    Wire,
    WirePoint,
    Net,
    ErcViolation,
    ToolMode,
    SchematicProject,
    Junction,
    NetLabel,
    BusEntry,
    SheetPort,
    SheetInstance,
    SheetDef,
    NetClass,
} from '../data/types';
import { symbolMap } from '../data/symbolLibrary';
import { computeNets, getPinAbsolutePosition } from '../engine/connectivity';
import { runErc } from '../engine/erc';
import { HistoryManager } from '../engine/history';
import { DEFAULT_NET_CLASSES, autoAssignNetClasses } from '../engine/netclass';

const history = new HistoryManager();
const AUTOSAVE_KEY = 'schematic_autosave';
const GRID_SIZE = 20;

// Reference designator counters
const refCounters: Record<string, number> = {};

function nextRef(prefix: string): string {
    if (!refCounters[prefix]) refCounters[prefix] = 0;
    refCounters[prefix]++;
    return `${prefix}${refCounters[prefix]}`;
}

function snapToGrid(val: number): number {
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

// ── BOM types ──────────────────────────────
export interface BomEntry {
    reference: string;
    value: string;
    footprint: string;
    symbolRef: string;
    quantity: number;
}

export interface SchematicState {
    // Data
    symbols: SymbolInstance[];
    wires: Wire[];
    junctions: Junction[];
    netLabels: NetLabel[];
    busEntries: BusEntry[];
    sheetPorts: SheetPort[];
    sheetInstances: SheetInstance[];
    sheetDefs: SheetDef[];
    netClasses: NetClass[];
    nets: Net[];
    ercViolations: ErcViolation[];

    // Active sheet navigation (tab-based)
    activeSheetId: string | null;  // null = root sheet
    sheetStack: string[];          // breadcrumb stack of sheet IDs

    // Canvas state
    stagePos: { x: number; y: number };
    stageScale: number;
    gridSize: number;

    // Tool state
    tool: ToolMode;
    selectedIds: string[];
    wireInProgress: WirePoint[] | null;
    busWireInProgress: WirePoint[] | null;
    placingSymbolRef: string | null;

    // Hover
    hoveredId: string | null;

    // Mouse position for ghost wire
    mousePos: { x: number; y: number } | null;

    // Context menu
    contextMenu: { x: number; y: number; canvasX: number; canvasY: number } | null;

    // Theme
    darkMode: boolean;

    // Project
    projectName: string;

    // Actions — Symbols
    addSymbol: (symbolRef: string, x: number, y: number) => void;
    moveSymbol: (id: string, x: number, y: number) => void;
    rotateSelected: () => void;
    flipSelected: () => void;
    deleteSelected: () => void;
    duplicateSelected: () => void;
    updateSymbolProperty: (id: string, key: string, value: string) => void;

    // Actions — Selection
    selectSymbol: (id: string, multi?: boolean) => void;
    selectArea: (ids: string[]) => void;
    clearSelection: () => void;

    // Actions — Wires
    startWire: (point: WirePoint) => void;
    addWirePoint: (point: WirePoint) => void;
    finishWire: () => void;
    addWire: (points: WirePoint[], netId?: string) => void;
    cancelWire: () => void;
    moveWireVertex: (wireId: string, vertexIndex: number, x: number, y: number) => void;
    insertWireVertex: (wireId: string, segmentIndex: number, x: number, y: number) => void;
    removeWireVertex: (wireId: string, vertexIndex: number) => void;

    // Actions — Bus
    startBusWire: (point: WirePoint) => void;
    addBusWirePoint: (point: WirePoint) => void;
    finishBusWire: (label: string) => void;
    cancelBusWire: () => void;
    addBusEntry: (x: number, y: number, busNetName: string, memberIndex: number, orientation?: 'left' | 'right') => void;
    removeBusEntry: (id: string) => void;

    // Actions — Junctions
    addJunction: (x: number, y: number) => void;
    removeJunction: (id: string) => void;

    // Actions — Net Labels
    addNetLabel: (x: number, y: number, name: string) => void;
    removeNetLabel: (id: string) => void;

    // Actions — Sheets (Hierarchy)
    addSheet: (name: string, x: number, y: number) => void;
    removeSheet: (id: string) => void;
    openSheet: (instanceId: string) => void;
    closeSheet: () => void;
    addSheetPort: (x: number, y: number, name: string, direction: SheetPort['direction'], side: SheetPort['side']) => void;
    removeSheetPort: (id: string) => void;

    // Actions — Net Classes
    addNetClass: (name: string, description: string, color: string) => void;
    updateNetClass: (id: string, updates: Partial<NetClass>) => void;
    removeNetClass: (id: string) => void;
    autoAssignNetClasses: () => void;

    // Actions — Tool
    setTool: (tool: ToolMode) => void;
    setPlacingSymbol: (ref: string | null) => void;

    // Actions — Canvas
    setStagePos: (pos: { x: number; y: number }) => void;
    setStageScale: (scale: number) => void;
    setMousePos: (pos: { x: number; y: number } | null) => void;

    // Actions — Hover
    setHoveredId: (id: string | null) => void;

    // Actions — Context menu
    openContextMenu: (x: number, y: number, canvasX: number, canvasY: number) => void;
    closeContextMenu: () => void;

    // Actions — Nets
    recalculateNets: () => void;

    // Actions — ERC
    runErc: () => void;

    // Actions — History
    undo: () => void;
    redo: () => void;
    saveSnapshot: () => void;

    // Reliability
    getHash: () => string;

    // Actions — Project
    newProject: () => void;
    saveProject: () => string;
    loadProject: (json: string) => void;
    autoSave: () => void;
    loadAutoSave: () => boolean;
    setProjectName: (name: string) => void;

    // Actions — Theme
    toggleDarkMode: () => void;

    // Actions — Annotation + BOM
    autoAnnotate: () => void;
    exportBom: () => BomEntry[];

    // Actions — Align/Distribute
    alignSelectedLeft: () => void;
    alignSelectedTop: () => void;
    distributeSelectedH: () => void;
    distributeSelectedV: () => void;
    addGeneratedSubsystem: (symbols: SymbolInstance[], wires: Wire[]) => void;
}

export const useSchematicStore = create<SchematicState>((set, get) => ({
    // ── Initial State ──────────────────────────
    symbols: [],
    wires: [],
    junctions: [],
    netLabels: [],
    busEntries: [],
    sheetPorts: [],
    sheetInstances: [],
    sheetDefs: [],
    netClasses: [...DEFAULT_NET_CLASSES],
    nets: [],
    ercViolations: [],
    activeSheetId: null,
    sheetStack: [],
    stagePos: { x: 0, y: 0 },
    stageScale: 1,
    gridSize: GRID_SIZE,
    tool: 'select',
    selectedIds: [],
    wireInProgress: null,
    busWireInProgress: null,
    placingSymbolRef: null,
    hoveredId: null,
    mousePos: null,
    contextMenu: null,
    darkMode: true,
    projectName: 'Untitled Project',

    // ── Symbol Actions ─────────────────────────
    addSymbol: (symbolRef, x, y) => {
        const def = symbolMap.get(symbolRef);
        if (!def) return;
        get().saveSnapshot();
        const instance: SymbolInstance = {
            id: uuid(),
            symbolRef,
            x: snapToGrid(x),
            y: snapToGrid(y),
            rotation: 0,
            mirrored: false,
            properties: {
                reference: nextRef(def.name),
                value: def.showValue ? '?' : def.name,
            },
        };
        set((s) => ({
            symbols: [...s.symbols, instance],
            selectedIds: [instance.id],
            tool: 'select',
            placingSymbolRef: null,
        }));
        get().recalculateNets();
        get().autoSave();
    },

    moveSymbol: (id, x, y) => {
        const state = get();
        const sym = state.symbols.find((s) => s.id === id);
        if (!sym) return;

        const def = symbolMap.get(sym.symbolRef);
        if (!def) {
            set((s) => ({
                symbols: s.symbols.map((s) =>
                    s.id === id ? { ...s, x: snapToGrid(x), y: snapToGrid(y) } : s
                ),
            }));
            get().recalculateNets();
            return;
        }

        // 1. Calculate old absolute pin positions (TIPS)
        const oldPins = def.pins.map((p) => getPinAbsolutePosition(sym, p));

        // 2. Perform move
        const newX = snapToGrid(x);
        const newY = snapToGrid(y);
        const dx = newX - sym.x;
        const dy = newY - sym.y;

        if (dx === 0 && dy === 0) return;

        set((s) => ({
            symbols: s.symbols.map((s) => (s.id === id ? { ...s, x: newX, y: newY } : s)),
            wires: s.wires.map((w) => {
                const newPoints = [...w.points];
                let changed = false;

                // Check endpoints
                const start = newPoints[0];
                const end = newPoints[newPoints.length - 1];

                for (const op of oldPins) {
                    // Start point matches an old pin position
                    if (Math.abs(start.x - op.x) < 2 && Math.abs(start.y - op.y) < 2) {
                        newPoints[0] = { x: start.x + dx, y: start.y + dy };
                        changed = true;
                    }
                    // End point matches an old pin position
                    if (Math.abs(end.x - op.x) < 2 && Math.abs(end.y - op.y) < 2) {
                        newPoints[newPoints.length - 1] = { x: end.x + dx, y: end.y + dy };
                        changed = true;
                    }
                }
                return changed ? { ...w, points: newPoints } : w;
            }),
        }));

        get().recalculateNets();
    },

    rotateSelected: () => {
        const { selectedIds, symbols, wires } = get();
        if (selectedIds.length === 0) return;
        get().saveSnapshot();

        let updatedWires = [...wires];

        const updatedSymbols = symbols.map((sym) => {
            if (!selectedIds.includes(sym.id)) return sym;

            const def = symbolMap.get(sym.symbolRef);
            if (!def) return { ...sym, rotation: (sym.rotation + 90) % 360 };

            // Old pin positions
            const oldPins = def.pins.map((p) => getPinAbsolutePosition(sym, p));

            const newSym = { ...sym, rotation: (sym.rotation + 90) % 360 };
            const newPins = def.pins.map((p) => getPinAbsolutePosition(newSym, p));

            // Update wires
            updatedWires = updatedWires.map((w) => {
                const newPoints = [...w.points];
                let changed = false;

                const start = newPoints[0];
                const end = newPoints[newPoints.length - 1];

                for (let i = 0; i < oldPins.length; i++) {
                    const op = oldPins[i];
                    const np = newPins[i];

                    if (Math.abs(start.x - op.x) < 2 && Math.abs(start.y - op.y) < 2) {
                        newPoints[0] = { x: np.x, y: np.y };
                        changed = true;
                    }
                    if (Math.abs(end.x - op.x) < 2 && Math.abs(end.y - op.y) < 2) {
                        newPoints[newPoints.length - 1] = { x: np.x, y: np.y };
                        changed = true;
                    }
                }
                return changed ? { ...w, points: newPoints } : w;
            });

            return newSym;
        });

        set({
            symbols: updatedSymbols,
            wires: updatedWires,
        });
        get().recalculateNets();
        get().autoSave();
    },

    flipSelected: () => {
        const { selectedIds, symbols, wires } = get();
        if (selectedIds.length === 0) return;
        get().saveSnapshot();

        let updatedWires = [...wires];

        const updatedSymbols = symbols.map((sym) => {
            if (!selectedIds.includes(sym.id)) return sym;

            const def = symbolMap.get(sym.symbolRef);
            if (!def) return { ...sym, mirrored: !sym.mirrored };

            // Old positions
            const oldPins = def.pins.map((p) => getPinAbsolutePosition(sym, p));

            const newSym = { ...sym, mirrored: !sym.mirrored };
            const newPins = def.pins.map((p) => getPinAbsolutePosition(newSym, p));

            // Update wires
            updatedWires = updatedWires.map((w) => {
                const newPoints = [...w.points];
                let changed = false;

                const start = newPoints[0];
                const end = newPoints[newPoints.length - 1];

                for (let i = 0; i < oldPins.length; i++) {
                    const op = oldPins[i];
                    const np = newPins[i];

                    if (Math.abs(start.x - op.x) < 2 && Math.abs(start.y - op.y) < 2) {
                        newPoints[0] = { x: np.x, y: np.y };
                        changed = true;
                    }
                    if (Math.abs(end.x - op.x) < 2 && Math.abs(end.y - op.y) < 2) {
                        newPoints[newPoints.length - 1] = { x: np.x, y: np.y };
                        changed = true;
                    }
                }
                return changed ? { ...w, points: newPoints } : w;
            });

            return newSym;
        });

        set({
            symbols: updatedSymbols,
            wires: updatedWires,
        });
        get().recalculateNets();
        get().autoSave();
    },

    deleteSelected: () => {
        const { selectedIds } = get();
        if (selectedIds.length === 0) return;
        get().saveSnapshot();
        set((s) => ({
            symbols: s.symbols.filter((sym) => !selectedIds.includes(sym.id)),
            wires: s.wires.filter((w) => !selectedIds.includes(w.id)),
            junctions: s.junctions.filter((j) => !selectedIds.includes(j.id)),
            netLabels: s.netLabels.filter((nl) => !selectedIds.includes(nl.id)),
            busEntries: s.busEntries.filter((be) => !selectedIds.includes(be.id)),
            sheetPorts: s.sheetPorts.filter((sp) => !selectedIds.includes(sp.id)),
            sheetInstances: s.sheetInstances.filter((si) => !selectedIds.includes(si.id)),
            selectedIds: [],
        }));
        get().recalculateNets();
        get().autoSave();
    },

    duplicateSelected: () => {
        const { selectedIds, symbols } = get();
        if (selectedIds.length === 0) return;
        get().saveSnapshot();
        const newSymbols: SymbolInstance[] = [];
        for (const id of selectedIds) {
            const sym = symbols.find((s) => s.id === id);
            if (sym) {
                const def = symbolMap.get(sym.symbolRef);
                newSymbols.push({
                    ...sym,
                    id: uuid(),
                    x: sym.x + GRID_SIZE * 2,
                    y: sym.y + GRID_SIZE * 2,
                    properties: {
                        ...sym.properties,
                        reference: def ? nextRef(def.name) : sym.properties.reference + '_copy',
                    },
                });
            }
        }
        set((s) => ({
            symbols: [...s.symbols, ...newSymbols],
            selectedIds: newSymbols.map((ns) => ns.id),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    updateSymbolProperty: (id, key, value) => {
        set((s) => ({
            symbols: s.symbols.map((sym) =>
                sym.id === id
                    ? { ...sym, properties: { ...sym.properties, [key]: value } }
                    : sym
            ),
        }));
        get().autoSave();
    },

    // ── Selection ──────────────────────────────
    selectSymbol: (id, multi) => {
        set((s) => ({
            selectedIds: multi
                ? s.selectedIds.includes(id)
                    ? s.selectedIds.filter((sid) => sid !== id)
                    : [...s.selectedIds, id]
                : [id],
        }));
    },

    selectArea: (ids) => {
        set({ selectedIds: ids });
    },

    clearSelection: () => {
        set({ selectedIds: [], contextMenu: null });
    },

    // ── Wires ──────────────────────────────────
    startWire: (point) => {
        set({
            wireInProgress: [{ x: snapToGrid(point.x), y: snapToGrid(point.y) }],
        });
    },

    addWirePoint: (point) => {
        const { wireInProgress } = get();
        if (!wireInProgress) return;
        const snapped = { x: snapToGrid(point.x), y: snapToGrid(point.y) };
        const last = wireInProgress[wireInProgress.length - 1];
        const intermediatePoints: WirePoint[] = [];
        if (last.x !== snapped.x && last.y !== snapped.y) {
            intermediatePoints.push({ x: snapped.x, y: last.y });
        }
        set({
            wireInProgress: [...wireInProgress, ...intermediatePoints, snapped],
        });
    },

    finishWire: () => {
        const { wireInProgress, wires } = get();
        if (!wireInProgress || wireInProgress.length < 2) {
            set({ wireInProgress: null });
            return;
        }
        get().saveSnapshot();
        const wire: Wire = {
            id: uuid(),
            points: wireInProgress,
        };

        // Auto-junction: check if any endpoint of the new wire lands on
        // the middle of an existing wire segment — auto-insert junction
        const autoJunctions: Junction[] = [];
        for (const ep of [wireInProgress[0], wireInProgress[wireInProgress.length - 1]]) {
            for (const existingWire of wires) {
                for (let s = 0; s < existingWire.points.length - 1; s++) {
                    const a = existingWire.points[s];
                    const b = existingWire.points[s + 1];
                    const isEndpoint =
                        (Math.abs(ep.x - a.x) < 2 && Math.abs(ep.y - a.y) < 2) ||
                        (Math.abs(ep.x - b.x) < 2 && Math.abs(ep.y - b.y) < 2);
                    if (!isEndpoint && pointOnSegmentStore(ep.x, ep.y, a.x, a.y, b.x, b.y)) {
                        autoJunctions.push({
                            id: uuid(),
                            x: snapToGrid(ep.x),
                            y: snapToGrid(ep.y),
                        });
                    }
                }
            }
        }

        set((s) => ({
            wires: [...s.wires, wire],
            junctions: [...s.junctions, ...deduplicateJunctions(s.junctions, autoJunctions)],
            wireInProgress: null,
        }));
        get().recalculateNets();
        get().autoSave();
    },

    addWire: (points, netId) => {
        get().saveSnapshot();
        const wire: Wire = {
            id: uuid(),
            points,
            netId,
        };
        set((s) => ({
            wires: [...s.wires, wire],
        }));
        get().recalculateNets();
        get().autoSave();
    },

    cancelWire: () => {
        set({ wireInProgress: null, busWireInProgress: null });
    },

    moveWireVertex: (wireId, vertexIndex, x, y) => {
        set((s) => ({
            wires: s.wires.map((w) => {
                if (w.id !== wireId) return w;
                const newPoints = [...w.points];
                newPoints[vertexIndex] = { x: snapToGrid(x), y: snapToGrid(y) };
                return { ...w, points: newPoints };
            }),
        }));
        get().recalculateNets();
    },

    insertWireVertex: (wireId, segmentIndex, x, y) => {
        get().saveSnapshot();
        set((s) => ({
            wires: s.wires.map((w) => {
                if (w.id !== wireId) return w;
                const newPoints = [...w.points];
                newPoints.splice(segmentIndex + 1, 0, { x: snapToGrid(x), y: snapToGrid(y) });
                return { ...w, points: newPoints };
            }),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    removeWireVertex: (wireId, vertexIndex) => {
        get().saveSnapshot();
        set((s) => ({
            wires: s.wires.map((w) => {
                if (w.id !== wireId) return w;
                if (w.points.length <= 2) return w;
                const newPoints = w.points.filter((_, i) => i !== vertexIndex);
                return { ...w, points: newPoints };
            }),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    // ── Bus ────────────────────────────────────
    startBusWire: (point) => {
        set({
            busWireInProgress: [{ x: snapToGrid(point.x), y: snapToGrid(point.y) }],
        });
    },

    addBusWirePoint: (point) => {
        const { busWireInProgress } = get();
        if (!busWireInProgress) return;
        const snapped = { x: snapToGrid(point.x), y: snapToGrid(point.y) };
        const last = busWireInProgress[busWireInProgress.length - 1];
        const intermediatePoints: WirePoint[] = [];
        if (last.x !== snapped.x && last.y !== snapped.y) {
            intermediatePoints.push({ x: snapped.x, y: last.y });
        }
        set({
            busWireInProgress: [...busWireInProgress, ...intermediatePoints, snapped],
        });
    },

    finishBusWire: (label) => {
        const { busWireInProgress } = get();
        if (!busWireInProgress || busWireInProgress.length < 2) {
            set({ busWireInProgress: null });
            return;
        }
        get().saveSnapshot();
        const busWire: Wire = {
            id: uuid(),
            points: busWireInProgress,
            isBus: true,
            busLabel: label,
        };
        set((s) => ({
            wires: [...s.wires, busWire],
            busWireInProgress: null,
        }));
        get().recalculateNets();
        get().autoSave();
    },

    cancelBusWire: () => {
        set({ busWireInProgress: null });
    },

    addBusEntry: (x, y, busNetName, memberIndex, orientation = 'right') => {
        get().saveSnapshot();
        const entry: BusEntry = {
            id: uuid(),
            x: snapToGrid(x),
            y: snapToGrid(y),
            busNetName,
            memberIndex,
            orientation,
        };
        set((s) => ({
            busEntries: [...s.busEntries, entry],
        }));
        get().recalculateNets();
        get().autoSave();
    },

    removeBusEntry: (id) => {
        get().saveSnapshot();
        set((s) => ({
            busEntries: s.busEntries.filter((be) => be.id !== id),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    // ── Junctions ──────────────────────────────
    addJunction: (x, y) => {
        get().saveSnapshot();
        const junction: Junction = {
            id: uuid(),
            x: snapToGrid(x),
            y: snapToGrid(y),
        };
        set((s) => ({
            junctions: [...s.junctions, junction],
        }));
        get().recalculateNets();
        get().autoSave();
    },

    removeJunction: (id) => {
        get().saveSnapshot();
        set((s) => ({
            junctions: s.junctions.filter((j) => j.id !== id),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    // ── Net Labels ─────────────────────────────
    addNetLabel: (x, y, name) => {
        get().saveSnapshot();
        const label: NetLabel = {
            id: uuid(),
            x: snapToGrid(x),
            y: snapToGrid(y),
            name,
            scope: 'local',
        };
        set((s) => ({
            netLabels: [...s.netLabels, label],
        }));
        get().recalculateNets();
        get().autoSave();
    },

    removeNetLabel: (id) => {
        get().saveSnapshot();
        set((s) => ({
            netLabels: s.netLabels.filter((nl) => nl.id !== id),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    // ── Sheet (Hierarchy) ──────────────────────
    addSheet: (name, x, y) => {
        get().saveSnapshot();
        const sheetDef: SheetDef = {
            id: uuid(),
            name,
            symbols: [],
            wires: [],
            junctions: [],
            netLabels: [],
            busEntries: [],
            sheetPorts: [],
            sheets: [],
        };
        const sheetInst: SheetInstance = {
            id: uuid(),
            sheetDefId: sheetDef.id,
            x: snapToGrid(x),
            y: snapToGrid(y),
            width: 200,
            height: 140,
            name,
            filename: `${name.replace(/\s+/g, '_').toLowerCase()}.sch`,
        };
        set((s) => ({
            sheetDefs: [...s.sheetDefs, sheetDef],
            sheetInstances: [...s.sheetInstances, sheetInst],
        }));
        get().autoSave();
    },

    removeSheet: (id) => {
        get().saveSnapshot();
        const inst = get().sheetInstances.find((si) => si.id === id);
        set((s) => ({
            sheetInstances: s.sheetInstances.filter((si) => si.id !== id),
            sheetDefs: inst
                ? s.sheetDefs.filter((sd) => sd.id !== inst.sheetDefId)
                : s.sheetDefs,
        }));
        get().autoSave();
    },

    openSheet: (instanceId) => {
        const inst = get().sheetInstances.find((si) => si.id === instanceId);
        if (!inst) return;
        set((s) => ({
            activeSheetId: inst.sheetDefId,
            sheetStack: [...s.sheetStack, inst.sheetDefId],
            selectedIds: [],
            wireInProgress: null,
            busWireInProgress: null,
        }));
    },

    closeSheet: () => {
        set((s) => {
            const newStack = [...s.sheetStack];
            newStack.pop();
            return {
                activeSheetId: newStack.length > 0 ? newStack[newStack.length - 1] : null,
                sheetStack: newStack,
                selectedIds: [],
            };
        });
    },

    addSheetPort: (x, y, name, direction, side) => {
        get().saveSnapshot();
        const port: SheetPort = {
            id: uuid(),
            x: snapToGrid(x),
            y: snapToGrid(y),
            name,
            direction,
            side,
        };
        const { activeSheetId } = get();
        if (activeSheetId) {
            // Add port to active child sheet
            set((s) => ({
                sheetDefs: s.sheetDefs.map((sd) =>
                    sd.id === activeSheetId
                        ? { ...sd, sheetPorts: [...sd.sheetPorts, port] }
                        : sd
                ),
            }));
        } else {
            // Add port to root
            set((s) => ({
                sheetPorts: [...s.sheetPorts, port],
            }));
        }
        get().recalculateNets();
        get().autoSave();
    },

    removeSheetPort: (id) => {
        get().saveSnapshot();
        const { activeSheetId } = get();
        if (activeSheetId) {
            set((s) => ({
                sheetDefs: s.sheetDefs.map((sd) =>
                    sd.id === activeSheetId
                        ? { ...sd, sheetPorts: sd.sheetPorts.filter((sp) => sp.id !== id) }
                        : sd
                ),
            }));
        } else {
            set((s) => ({
                sheetPorts: s.sheetPorts.filter((sp) => sp.id !== id),
            }));
        }
        get().recalculateNets();
        get().autoSave();
    },

    // ── Net Classes ────────────────────────────
    addNetClass: (name, description, color) => {
        const nc: NetClass = {
            id: `nc_${uuid().slice(0, 8)}`,
            name,
            description,
            color,
            constraints: { clearance: 8, traceWidth: 10, viaSize: 24, viaDrill: 12 },
            patterns: [],
        };
        set((s) => ({
            netClasses: [...s.netClasses, nc],
        }));
        get().autoSave();
    },

    updateNetClass: (id, updates) => {
        set((s) => ({
            netClasses: s.netClasses.map((nc) =>
                nc.id === id ? { ...nc, ...updates } : nc
            ),
        }));
        get().autoSave();
    },

    removeNetClass: (id) => {
        if (id === 'nc_default') return; // Cannot remove default
        set((s) => ({
            netClasses: s.netClasses.filter((nc) => nc.id !== id),
        }));
        get().autoSave();
    },

    autoAssignNetClasses: () => {
        const { nets, netClasses } = get();
        const updated = autoAssignNetClasses(nets, netClasses);
        set({ nets: updated });
    },

    // ── Tool ───────────────────────────────────
    setTool: (tool) => {
        set({ tool, wireInProgress: null, busWireInProgress: null, placingSymbolRef: null, contextMenu: null });
    },

    setPlacingSymbol: (ref) => {
        set({
            placingSymbolRef: ref,
            tool: ref ? 'place' : 'select',
        });
    },

    // ── Canvas ─────────────────────────────────
    setStagePos: (pos) => set({ stagePos: pos }),
    setStageScale: (scale) => set({ stageScale: Math.max(0.1, Math.min(5, scale)) }),
    setMousePos: (pos) => set({ mousePos: pos }),

    // ── Hover ──────────────────────────────────
    setHoveredId: (id) => set({ hoveredId: id }),

    // ── Context Menu ───────────────────────────
    openContextMenu: (x, y, canvasX, canvasY) => {
        set({ contextMenu: { x, y, canvasX, canvasY } });
    },
    closeContextMenu: () => set({ contextMenu: null }),

    // ── Nets ───────────────────────────────────
    recalculateNets: () => {
        const { symbols, wires, junctions, netLabels, netClasses } = get();
        const nets = computeNets(symbols, wires, junctions, netLabels);
        const classified = autoAssignNetClasses(nets, netClasses);
        set({ nets: classified });
    },

    // ── ERC ────────────────────────────────────
    runErc: () => {
        const { symbols, wires, junctions, netLabels, sheetPorts, sheetInstances, sheetDefs, busEntries } = get();
        const violations = runErc(
            symbols, wires, junctions, netLabels,
            sheetPorts, sheetInstances, sheetDefs, busEntries
        );
        set({ ercViolations: violations });
    },

    getHash: () => {
        const { symbols, wires, junctions, netLabels, nets } = get();

        // Canonical sort and simplified mapping for stability
        const syms = [...symbols].sort((a, b) => a.id.localeCompare(b.id)).map(s => ({
            id: s.id, ref: s.properties.reference, x: s.x, y: s.y, rot: s.rotation
        }));

        const wrs = [...wires].sort((a, b) => a.id.localeCompare(b.id)).map(w => ({
            id: w.id, pts: w.points.map(p => `${p.x},${p.y}`).join('|')
        }));

        const juncs = [...junctions].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y).map(j => `${j.x},${j.y}`);
        const lbs = [...netLabels].sort((a, b) => a.id.localeCompare(b.id)).map(l => ({ n: l.name, x: l.x, y: l.y }));

        // Nets are results — hash them too for "Correctness Hardening"
        const nts = [...nets].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(n => ({
            name: n.name,
            pins: [...n.pinRefs].sort((a, b) => (a.symbolId + a.pinId).localeCompare(b.symbolId + b.pinId)),
            wires: [...n.wireIds].sort()
        }));

        const stateObj = { syms, wrs, juncs, lbs, nts };
        return JSON.stringify(stateObj);
    },

    // ── History ────────────────────────────────
    saveSnapshot: () => {
        const { symbols, wires, junctions, netLabels, busEntries, sheetPorts, sheetInstances, sheetDefs, netClasses } = get();
        history.push({
            symbols, wires, junctions, netLabels, busEntries,
            sheetPorts,
            sheets: sheetInstances,
            sheetDefs,
            netClasses
        });
    },

    undo: () => {
        const { symbols, wires, junctions, netLabels, busEntries, sheetPorts, sheetInstances, sheetDefs, netClasses } = get();
        const prev = history.undo({
            symbols, wires, junctions, netLabels, busEntries,
            sheetPorts,
            sheets: sheetInstances,
            sheetDefs,
            netClasses
        });
        if (prev) {
            set({
                symbols: prev.symbols,
                wires: prev.wires,
                junctions: prev.junctions,
                netLabels: prev.netLabels,
                busEntries: prev.busEntries,
                sheetPorts: prev.sheetPorts,
                sheetInstances: prev.sheets,
                sheetDefs: prev.sheetDefs,
                netClasses: prev.netClasses,
                selectedIds: [],
            });
            get().recalculateNets();
            get().autoSave();
        }
    },

    redo: () => {
        const { symbols, wires, junctions, netLabels, busEntries, sheetPorts, sheetInstances, sheetDefs, netClasses } = get();
        const next = history.redo({
            symbols, wires, junctions, netLabels, busEntries,
            sheetPorts,
            sheets: sheetInstances,
            sheetDefs,
            netClasses
        });
        if (next) {
            set({
                symbols: next.symbols,
                wires: next.wires,
                junctions: next.junctions,
                netLabels: next.netLabels,
                busEntries: next.busEntries,
                sheetPorts: next.sheetPorts,
                sheetInstances: next.sheets,
                sheetDefs: next.sheetDefs,
                netClasses: next.netClasses,
                selectedIds: [],
            });
            get().recalculateNets();
            get().autoSave();
        }
    },

    // ── Project ────────────────────────────────
    newProject: () => {
        history.clear();
        Object.keys(refCounters).forEach((k) => delete refCounters[k]);
        set({
            symbols: [],
            wires: [],
            junctions: [],
            netLabels: [],
            busEntries: [],
            sheetPorts: [],
            sheetInstances: [],
            sheetDefs: [],
            netClasses: [...DEFAULT_NET_CLASSES],
            nets: [],
            ercViolations: [],
            selectedIds: [],
            wireInProgress: null,
            busWireInProgress: null,
            activeSheetId: null,
            sheetStack: [],
            stagePos: { x: 0, y: 0 },
            stageScale: 1,
            projectName: 'Untitled Project',
        });
    },

    saveProject: () => {
        const { symbols, wires, junctions, netLabels, busEntries, sheetPorts, sheetInstances, sheetDefs, netClasses, nets, gridSize, projectName } = get();
        const project: SchematicProject = {
            projectId: uuid(),
            name: projectName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            symbols,
            wires,
            junctions,
            netLabels,
            busEntries,
            sheets: sheetInstances,
            sheetDefs,
            sheetPorts,
            netClasses,
            nets,
            metadata: {
                gridSize,
                canvasWidth: 4000,
                canvasHeight: 3000,
            },
        };
        return JSON.stringify(project, null, 2);
    },

    loadProject: (json) => {
        try {
            const project: SchematicProject = JSON.parse(json);
            history.clear();
            Object.keys(refCounters).forEach((k) => delete refCounters[k]);
            for (const sym of project.symbols) {
                const ref = sym.properties.reference;
                const match = ref.match(/^([A-Za-z_]+)(\d+)$/);
                if (match) {
                    const prefix = match[1];
                    const num = parseInt(match[2]);
                    refCounters[prefix] = Math.max(refCounters[prefix] || 0, num);
                }
            }
            set({
                symbols: project.symbols,
                wires: project.wires,
                junctions: project.junctions || [],
                netLabels: project.netLabels || [],
                busEntries: project.busEntries || [],
                sheetInstances: project.sheets || [],
                sheetDefs: project.sheetDefs || [],
                sheetPorts: project.sheetPorts || [],
                netClasses: project.netClasses || [...DEFAULT_NET_CLASSES],
                nets: project.nets || [],
                ercViolations: [],
                selectedIds: [],
                wireInProgress: null,
                busWireInProgress: null,
                activeSheetId: null,
                sheetStack: [],
                projectName: project.name || 'Loaded Project',
            });
            get().recalculateNets();
        } catch (e) {
            console.error('Failed to load project:', e);
        }
    },

    autoSave: () => {
        const json = get().saveProject();
        try {
            localStorage.setItem(AUTOSAVE_KEY, json);
        } catch (_e) {
            // Storage full or unavailable
        }
    },

    loadAutoSave: () => {
        const json = localStorage.getItem(AUTOSAVE_KEY);
        if (json) {
            get().loadProject(json);
            return true;
        }
        return false;
    },

    setProjectName: (name) => set({ projectName: name }),

    // ── Theme ──────────────────────────────────
    toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

    // ── Annotation ─────────────────────────────
    autoAnnotate: () => {
        get().saveSnapshot();
        const { symbols } = get();
        const byType = new Map<string, SymbolInstance[]>();
        for (const sym of symbols) {
            const def = symbolMap.get(sym.symbolRef);
            if (!def) continue;
            if (!byType.has(def.name)) byType.set(def.name, []);
            byType.get(def.name)!.push(sym);
        }
        const updated = [...symbols];
        for (const [prefix, syms] of byType) {
            const sorted = [...syms].sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
            for (let i = 0; i < sorted.length; i++) {
                const idx = updated.findIndex((s) => s.id === sorted[i].id);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        properties: {
                            ...updated[idx].properties,
                            reference: `${prefix}${i + 1}`,
                        },
                    };
                }
            }
            refCounters[prefix] = syms.length;
        }
        set({ symbols: updated });
        get().autoSave();
    },

    // ── BOM Export ──────────────────────────────
    exportBom: () => {
        const { symbols } = get();
        const bomMap = new Map<string, BomEntry>();
        for (const sym of symbols) {
            const def = symbolMap.get(sym.symbolRef);
            if (!def) continue;
            if (def.category === 'Power') continue;
            const key = `${sym.symbolRef}::${sym.properties.value}`;
            if (bomMap.has(key)) {
                bomMap.get(key)!.quantity++;
                bomMap.get(key)!.reference += `, ${sym.properties.reference}`;
            } else {
                bomMap.set(key, {
                    reference: sym.properties.reference,
                    value: sym.properties.value,
                    footprint: '',
                    symbolRef: sym.symbolRef,
                    quantity: 1,
                });
            }
        }
        return [...bomMap.values()].sort((a, b) => a.reference.localeCompare(b.reference));
    },

    // ── Align / Distribute ─────────────────────
    alignSelectedLeft: () => {
        const { selectedIds, symbols } = get();
        if (selectedIds.length < 2) return;
        get().saveSnapshot();
        const selected = symbols.filter((s) => selectedIds.includes(s.id));
        const minX = Math.min(...selected.map((s) => s.x));
        set((s) => ({
            symbols: s.symbols.map((sym) =>
                selectedIds.includes(sym.id) ? { ...sym, x: minX } : sym
            ),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    alignSelectedTop: () => {
        const { selectedIds, symbols } = get();
        if (selectedIds.length < 2) return;
        get().saveSnapshot();
        const selected = symbols.filter((s) => selectedIds.includes(s.id));
        const minY = Math.min(...selected.map((s) => s.y));
        set((s) => ({
            symbols: s.symbols.map((sym) =>
                selectedIds.includes(sym.id) ? { ...sym, y: minY } : sym
            ),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    distributeSelectedH: () => {
        const { selectedIds, symbols } = get();
        if (selectedIds.length < 3) return;
        get().saveSnapshot();
        const selected = symbols
            .filter((s) => selectedIds.includes(s.id))
            .sort((a, b) => a.x - b.x);
        const minX = selected[0].x;
        const maxX = selected[selected.length - 1].x;
        const step = (maxX - minX) / (selected.length - 1);
        const updates = new Map<string, number>();
        selected.forEach((s, i) => updates.set(s.id, snapToGrid(minX + step * i)));
        set((s) => ({
            symbols: s.symbols.map((sym) =>
                updates.has(sym.id) ? { ...sym, x: updates.get(sym.id)! } : sym
            ),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    distributeSelectedV: () => {
        const { selectedIds, symbols } = get();
        if (selectedIds.length < 3) return;
        get().saveSnapshot();
        const selected = symbols
            .filter((s) => selectedIds.includes(s.id))
            .sort((a, b) => a.y - b.y);
        const minY = selected[0].y;
        const maxY = selected[selected.length - 1].y;
        const step = (maxY - minY) / (selected.length - 1);
        const updates = new Map<string, number>();
        selected.forEach((s, i) => updates.set(s.id, snapToGrid(minY + step * i)));
        set((s) => ({
            symbols: s.symbols.map((sym) =>
                updates.has(sym.id) ? { ...sym, y: updates.get(sym.id)! } : sym
            ),
        }));
        get().recalculateNets();
        get().autoSave();
    },

    addGeneratedSubsystem: (symbols, wires) => {
        get().saveSnapshot();
        set((s) => ({
            symbols: [...s.symbols, ...symbols],
            wires: [...s.wires, ...wires],
        }));
        get().recalculateNets();
        get().autoSave();
    },
}));

// ── Helpers ────────────────────────────────────

function pointOnSegmentStore(
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number
): boolean {
    if (Math.abs(ay - by) < 1 && Math.abs(py - ay) < 4) {
        const minX = Math.min(ax, bx);
        const maxX = Math.max(ax, bx);
        return px >= minX + 4 && px <= maxX - 4; // Exclude endpoints
    }
    if (Math.abs(ax - bx) < 1 && Math.abs(px - ax) < 4) {
        const minY = Math.min(ay, by);
        const maxY = Math.max(ay, by);
        return py >= minY + 4 && py <= maxY - 4;
    }
    return false;
}

function deduplicateJunctions(existing: Junction[], newOnes: Junction[]): Junction[] {
    return newOnes.filter((nj) =>
        !existing.some((ej) => Math.abs(ej.x - nj.x) < 2 && Math.abs(ej.y - nj.y) < 2)
    );
}
