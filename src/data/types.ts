/* ──────────────────────────────────────────────
   Shared type definitions for the schematic capture platform
   ────────────────────────────────────────────── */

// ── Graphic Primitives ──────────────────────

export type GraphicPrimitive =
    | { type: 'line'; x1: number; y1: number; x2: number; y2: number; strokeWidth?: number }
    | { type: 'rect'; x: number; y: number; width: number; height: number; fill?: string }
    | { type: 'circle'; cx: number; cy: number; r: number; fill?: string }
    | { type: 'arc'; cx: number; cy: number; r: number; startAngle: number; endAngle: number }
    | { type: 'polyline'; points: number[]; strokeWidth?: number; fill?: string }
    | { type: 'text'; x: number; y: number; text: string; fontSize?: number; align?: string };

// ── Pin Types ───────────────────────────────

export type PinElectricalType =
    | 'input'
    | 'output'
    | 'bidirectional'
    | 'passive'
    | 'power_in'
    | 'power_out'
    | 'open_collector'
    | 'open_emitter'
    | 'unspecified';

export interface PinDef {
    id: string;
    name: string;
    number?: string;   // Added for KiCad style
    x: number;        // relative to symbol origin
    y: number;
    length?: number;
    orientation?: 'left' | 'right' | 'up' | 'down';
    electricalType: PinElectricalType;
}

// ── Component Semantic Metadata ──────────────
export interface ComponentSemanticMetadata {
    voltageDomain?: '3.3V' | '5V' | '12V' | 'ADJUSTABLE';
    maxVoltage?: number;
    isHighSpeed?: boolean; // SPI, Ethernet, RMII
    requiresDecoupling?: boolean;
    category: 'digital' | 'analog' | 'power' | 'mixed' | 'passive';
    isPowerSource?: boolean;
}

// ── Symbol Definition (library) ─────────────

export interface SymbolDef {
    id: string;
    name: string;
    category: string;
    description?: string;
    pins: PinDef[];
    graphics: GraphicPrimitive[];
    width: number;
    height: number;
    showValue?: boolean;
    metadata?: ComponentSemanticMetadata;
}

// ── Symbol Instance (placed on canvas) ──────

export interface SymbolInstance {
    id: string;
    symbolRef: string;   // references SymbolDef.id
    x: number;
    y: number;
    rotation: number;    // degrees: 0, 90, 180, 270
    mirrored: boolean;
    properties: {
        reference: string; // "R1", "C1"
        value: string;     // "10k", "100nF"
        [key: string]: string;
    };
}

// ── Wire ────────────────────────────────────

export interface WirePoint {
    x: number;
    y: number;
}

export interface Wire {
    id: string;
    points: WirePoint[];
    netId?: string;
    isBus?: boolean;      // true → rendered as thick bus wire
    busLabel?: string;    // e.g. "DATA[0..7]"
}

// ── Junction ────────────────────────────────
// Explicit connection point — crossing wires only connect if a junction exists

export interface Junction {
    id: string;
    x: number;
    y: number;
}

// ── Net Label ───────────────────────────────
// Virtual net naming — connects all points sharing the same label name

export type NetLabelScope = 'local' | 'global';

export interface NetLabel {
    id: string;
    x: number;
    y: number;
    name: string;
    scope: NetLabelScope;
}

// ── Bus System ──────────────────────────────

/** Parsed bus label — e.g. "DATA[0..7]" → { name: "DATA", rangeStart: 0, rangeEnd: 7 } */
export interface BusLabel {
    name: string;
    rangeStart: number;
    rangeEnd: number;
}

/** Bus entry — fan-out from a bus wire to an individual net member */
export interface BusEntry {
    id: string;
    x: number;
    y: number;
    busNetName: string;   // which bus it connects to, e.g. "DATA"
    memberIndex: number;  // which member, e.g. 3 → DATA3
    orientation: 'left' | 'right'; // direction of the fan-out diagonal
}

// ── Hierarchical Sheets ─────────────────────

/** Port direction for sheet ports */
export type SheetPortDirection = 'input' | 'output' | 'bidirectional' | 'passive';

/** Sheet port — connection point on the edge of a sub-sheet */
export interface SheetPort {
    id: string;
    x: number;
    y: number;
    name: string;
    direction: SheetPortDirection;
    side: 'left' | 'right' | 'top' | 'bottom';
}

/** Sheet definition — a self-contained sub-schematic canvas */
export interface SheetDef {
    id: string;
    name: string;
    symbols: SymbolInstance[];
    wires: Wire[];
    junctions: Junction[];
    netLabels: NetLabel[];
    busEntries: BusEntry[];
    sheetPorts: SheetPort[];
    sheets: SheetInstance[];   // nested sub-sheets (recursive)
}

/** Sheet instance — placed reference to a SheetDef on a parent sheet */
export interface SheetInstance {
    id: string;
    sheetDefId: string;   // which SheetDef this instance refers to
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;         // display name on the sheet block
    filename: string;     // logical filename for the sub-sheet
}

// ── Net Classes ─────────────────────────────

export interface NetClassConstraint {
    clearance?: number;     // PCB clearance (mils)
    traceWidth?: number;    // trace width (mils)
    viaSize?: number;       // via diameter (mils)
    viaDrill?: number;      // via drill (mils)
}

export interface NetClass {
    id: string;
    name: string;           // "Default", "Power", "HighSpeed"
    description: string;
    color: string;          // display color for net highlighting
    constraints: NetClassConstraint;
    patterns: string[];     // auto-match patterns, e.g. ["VCC", "GND", "+*V"]
}

// ── Net ─────────────────────────────────────

export interface Net {
    id: string;
    name?: string;
    pinRefs: { symbolId: string; pinId: string }[];
    wireIds: string[];
    netClassId?: string;    // assigned net class
    sheetPath?: string;     // hierarchical path, e.g. "/root/power_supply"
}

// ── ERC ─────────────────────────────────────

export type ErcSeverity = 'error' | 'warning' | 'info';

export interface ErcViolation {
    id: string;
    severity: ErcSeverity;
    message: string;
    symbolIds?: string[];
    wireIds?: string[];
    pinRefs?: { symbolId: string; pinId: string }[];
    sheetPath?: string;     // which sheet the violation is on
}

// ── Project ─────────────────────────────────

export interface SchematicProject {
    projectId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    symbols: SymbolInstance[];
    wires: Wire[];
    junctions: Junction[];
    netLabels: NetLabel[];
    busEntries: BusEntry[];
    sheets: SheetInstance[];
    sheetDefs: SheetDef[];
    sheetPorts: SheetPort[];
    netClasses: NetClass[];
    nets: Net[];
    metadata: {
        gridSize: number;
        canvasWidth: number;
        canvasHeight: number;
        [key: string]: unknown;
    };
    pcbProject?: PcbProject;
}

/* ── AI Design Intelligence Types ──────────────── */

export type HintSeverity = 'info' | 'warning' | 'error' | 'success';
export type HintCategory = 'general' | 'layout' | 'si' | 'power' | 'bom';

export interface DesignHint {
    id: string;
    severity: HintSeverity;
    category: HintCategory;
    message: string;
    description?: string;
    relatedIds?: string[]; // IDs of symbols, nets, or footprints
    action?: {
        label: string;
        type: string;
        payload: any;
    };
}

export interface ProjectAdvice {
    hints: DesignHint[];
    score: number; // Overall design quality score 0-100
    lastUpdated: number;
}

export interface SignalIntegrityInfo {
    netId: string;
    length: number; // mm
    propagationDelay: number; // ps
    estimatedCrosstalk: number; // dB
    violations: string[];
}
// ── PCB Layout Types ───────────────────────

export type PcbLayer =
    | 'F.Cu'        // Front Copper
    | 'B.Cu'        // Back Copper
    | 'F.SilkS'     // Front Silkscreen
    | 'B.SilkS'     // Back Silkscreen
    | 'F.Mask'      // Front Solder Mask
    | 'B.Mask'      // Back Solder Mask
    | 'F.CrtYd'     // Front Courtyard
    | 'B.CrtYd'     // Back Courtyard
    | 'Edge.Cuts';  // Board Outline

export interface PcbLayerDef {
    id: PcbLayer;
    name: string;
    visible: boolean;
    color: string;
}

export type PadShape = 'circle' | 'rect' | 'oval' | 'roundrect';

export interface PadDef {
    id: string;         // pad number/name, e.g. "1"
    shape: PadShape;
    x: number;          // relative to footprint origin
    y: number;
    width: number;
    height: number;
    drill?: number;     // 0 or undefined for SMD pads
    layer: PcbLayer;    // usually F.Cu or B.Cu
}

export interface FootprintDef {
    id: string;
    name: string;
    symbolRef?: string; // link to schematic symbol
    pads: PadDef[];
    graphics: GraphicPrimitive[];
    courtyard: { x: number; y: number; width: number; height: number };
}

export interface FootprintInstance {
    id: string;
    footprintRef: string; // references FootprintDef.id
    componentRef: string; // references SymbolInstance.properties.reference, e.g. "R1"
    schematicSymbolId?: string; // Stable link to SymbolInstance.id
    x: number;
    y: number;
    rotation: number;
    flipped: boolean;     // true if on back layer
}

export interface TracePoint {
    x: number;
    y: number;
}

export interface PcbTrace {
    id: string;
    points: TracePoint[];
    width: number;
    layer: PcbLayer;
    netId?: string;
}

export interface PcbVia {
    id: string;
    x: number;
    y: number;
    size: number;
    drill: number;
    netId?: string;
}

export interface BoardOutline {
    points: { x: number; y: number }[];
}

export type PcbToolMode =
    | 'select'
    | 'route'
    | 'via'
    | 'outline'
    | 'place'
    | 'delete';

export interface PcbViolation {
    id: string;
    severity: 'error' | 'warning';
    message: string;
    points: { x: number; y: number }[];
}

export interface PcbProject {
    footprints: FootprintInstance[];
    traces: PcbTrace[];
    vias: PcbVia[];
    outline: BoardOutline;
    layers: PcbLayerDef[];
    violations: PcbViolation[];
}

// ── Tool modes ──────────────────────────────

export type ToolMode =
    | 'select'
    | 'wire'
    | 'bus'
    | 'place'
    | 'text'
    | 'delete'
    | 'junction'
    | 'netlabel'
    | 'busentry'
    | 'sheetport';

// ── History ─────────────────────────────────

export interface HistoryEntry {
    symbols: SymbolInstance[];
    wires: Wire[];
    junctions: Junction[];
    netLabels: NetLabel[];
    busEntries: BusEntry[];
    sheetPorts: SheetPort[];
    sheets: SheetInstance[];
    sheetDefs: SheetDef[];
    netClasses: NetClass[];
}
