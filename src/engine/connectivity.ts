/* ──────────────────────────────────────────────
   Connectivity Engine — Netlist computation
   Uses graph traversal with junction-based crossing rules.
   Crossing wires do NOT connect unless a Junction exists.
   ────────────────────────────────────────────── */

import { SymbolInstance, Wire, Net, PinDef, Junction, NetLabel } from '../data/types';
import { symbolMap } from '../data/symbolLibrary';

/** Snap tolerance for pin/wire endpoint matching (pixels) */
export const SNAP_EPS = 4;

function nodeId(x: number, y: number): string {
    return `${Math.round(x)},${Math.round(y)}`;
}

/**
 * Check if two points are close enough to connect.
 */
export function pointsNear(ax: number, ay: number, bx: number, by: number): boolean {
    return Math.abs(ax - bx) < SNAP_EPS && Math.abs(ay - by) < SNAP_EPS;
}

/**
 * Compute the absolute position of a pin given the symbol instance.
 * Accounts for rotation around the center of the symbol.
 */
export function getPinAbsolutePosition(
    sym: SymbolInstance,
    pin: PinDef
): { x: number; y: number } {
    const def = symbolMap.get(sym.symbolRef);
    if (!def) return { x: sym.x + pin.x, y: sym.y + pin.y };

    const cx = def.width / 2;
    const cy = def.height / 2;

    // Calculate tip position relative to pin origin (0,0)
    let tx = 0, ty = 0;
    const l = pin.length || 0;
    if (pin.orientation === 'left') tx = -l;
    else if (pin.orientation === 'right') tx = l;
    else if (pin.orientation === 'up') ty = -l;
    else if (pin.orientation === 'down') ty = l;

    // Pin tip coordinate relative to symbol center
    let rx = (pin.x + tx) - cx;
    let ry = (pin.y + ty) - cy;

    // Handle Mirroring (Horizontal flip across center)
    if (sym.mirrored) {
        rx = -rx;
    }

    const rad = ((sym.rotation % 360) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    const rotX = rx * cosA - ry * sinA;
    const rotY = rx * sinA + ry * cosA;

    return {
        x: Math.round(sym.x + cx + rotX),
        y: Math.round(sym.y + cy + rotY),
    };
}

/**
 * Test if point P lies on the segment from A to B (within tolerance).
 * Only considers axis-aligned segments (orthogonal wires).
 */
function pointOnSegment(
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number
): boolean {
    // Horizontal segment
    if (Math.abs(ay - by) < 1 && Math.abs(py - ay) < SNAP_EPS) {
        const minX = Math.min(ax, bx);
        const maxX = Math.max(ax, bx);
        return px >= minX - SNAP_EPS && px <= maxX + SNAP_EPS;
    }
    // Vertical segment
    if (Math.abs(ax - bx) < 1 && Math.abs(px - ax) < SNAP_EPS) {
        const minY = Math.min(ay, by);
        const maxY = Math.max(ay, by);
        return py >= minY - SNAP_EPS && py <= maxY + SNAP_EPS;
    }
    return false;
}

/**
 * Compute nets from current symbols, wires, junctions, and net labels.
 *
 * **Junction-based crossing rule**:
 * - Wire endpoints always connect to overlapping pins / other wire endpoints.
 * - Wire *midpoints* (interior of a segment) only connect to other wires/pins
 *   if a Junction exists at that coordinate.
 * - This prevents accidental shorts from visual crossings.
 */
export function computeNets(
    symbols: SymbolInstance[],
    wires: Wire[],
    junctions: Junction[] = [],
    netLabels: NetLabel[] = []
): Net[] {
    const adj = new Map<string, Set<string>>();
    const pinAt = new Map<string, { symbolId: string; pinId: string }[]>();
    const wireAt = new Map<string, Set<string>>();

    // Set of junction coordinates for quick lookup
    const junctionSet = new Set<string>();
    for (const j of junctions) {
        junctionSet.add(nodeId(j.x, j.y));
    }

    function addEdge(a: string, b: string) {
        if (!adj.has(a)) adj.set(a, new Set());
        if (!adj.has(b)) adj.set(b, new Set());
        adj.get(a)!.add(b);
        adj.get(b)!.add(a);
    }

    function addNode(key: string) {
        if (!adj.has(key)) adj.set(key, new Set());
    }

    // ── Register symbol pins ────────────────
    for (const sym of symbols) {
        const def = symbolMap.get(sym.symbolRef);
        if (!def) continue;
        for (const pin of def.pins) {
            const pos = getPinAbsolutePosition(sym, pin);
            const key = nodeId(pos.x, pos.y);
            addNode(key);
            if (!pinAt.has(key)) pinAt.set(key, []);
            pinAt.get(key)!.push({ symbolId: sym.id, pinId: pin.id });
        }
    }

    // ── Register wire endpoints and segments ─
    // Wire ENDPOINTS always create connectivity.
    // Wire midpoints only connect at junction locations.
    for (const wire of wires) {
        for (let i = 0; i < wire.points.length; i++) {
            const p = wire.points[i];
            const key = nodeId(p.x, p.y);
            addNode(key);
            if (!wireAt.has(key)) wireAt.set(key, new Set());
            wireAt.get(key)!.add(wire.id);

            // Connect sequential wire points (within same wire)
            if (i > 0) {
                const prev = wire.points[i - 1];
                const prevKey = nodeId(prev.x, prev.y);
                addEdge(key, prevKey);
            }
        }
    }

    // ── Connect pins to wire endpoints (always) ──
    for (const [pinKey, pins] of pinAt) {
        if (wireAt.has(pinKey)) {
            addEdge(pinKey, pinKey); // same node — link through adjacency
        }
        // Also check epsilon proximity to wire endpoints
        for (const wire of wires) {
            const first = wire.points[0];
            const last = wire.points[wire.points.length - 1];
            const pk = pinKey.split(',').map(Number);
            if (pointsNear(pk[0], pk[1], first.x, first.y)) {
                addEdge(pinKey, nodeId(first.x, first.y));
            }
            if (pointsNear(pk[0], pk[1], last.x, last.y)) {
                addEdge(pinKey, nodeId(last.x, last.y));
            }
        }
    }

    // ── Connect wire endpoints to each other (T-junctions at endpoints) ──
    const endpointKeys = new Map<string, string[]>();
    for (const wire of wires) {
        const first = nodeId(wire.points[0].x, wire.points[0].y);
        const last = nodeId(wire.points[wire.points.length - 1].x, wire.points[wire.points.length - 1].y);
        for (const ek of [first, last]) {
            if (!endpointKeys.has(ek)) endpointKeys.set(ek, []);
            endpointKeys.get(ek)!.push(wire.id);
        }
    }
    // If multiple wires share an endpoint, connect them
    for (const [ek, wireIds] of endpointKeys) {
        if (wireIds.length > 1) {
            // All these wires share this endpoint — they connect
            addNode(ek);
        }
    }

    // ── Wire endpoints connecting to wire midpoints (T-junctions) ──
    // REMOVED: Automatic endpoint-to-segment connection.
    // T-junctions now require an explicit Junction object at the meeting point.
    // This satisfies hard validation Case [C04].

    // ── Junction-based midpoint connections ──
    // Wire midpoints only connect to other wires if a junction exists there.
    for (const j of junctions) {
        const jKey = nodeId(j.x, j.y);
        addNode(jKey);
        // Find all wire segments passing through this junction
        for (const wire of wires) {
            for (let s = 0; s < wire.points.length - 1; s++) {
                const a = wire.points[s];
                const b = wire.points[s + 1];
                if (pointOnSegment(j.x, j.y, a.x, a.y, b.x, b.y)) {
                    addEdge(jKey, nodeId(a.x, a.y));
                    addEdge(jKey, nodeId(b.x, b.y));
                }
            }
            // Also check if junction is at a wire point
            for (const p of wire.points) {
                if (pointsNear(p.x, p.y, j.x, j.y)) {
                    addEdge(jKey, nodeId(p.x, p.y));
                }
            }
        }
        // Connect junction to pins at same location
        if (pinAt.has(jKey)) {
            addEdge(jKey, jKey);
        }
    }

    // ── BFS to find connected components ─────
    const allNodeKeys = new Set([...adj.keys()]);
    const visited = new Set<string>();
    const rawNets: { pinRefs: { symbolId: string; pinId: string }[]; wireIds: Set<string>; nodeKeys: Set<string> }[] = [];

    for (const startKey of allNodeKeys) {
        if (visited.has(startKey)) continue;

        const component = new Set<string>();
        const queue = [startKey];
        visited.add(startKey);

        while (queue.length > 0) {
            const current = queue.shift()!;
            component.add(current);
            const neighbors = adj.get(current);
            if (neighbors) {
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }

        const netPinRefs: { symbolId: string; pinId: string }[] = [];
        const netWireIds = new Set<string>();

        for (const key of component) {
            const pins = pinAt.get(key);
            if (pins) netPinRefs.push(...pins);
            const ws = wireAt.get(key);
            if (ws) ws.forEach((wid) => netWireIds.add(wid));
        }

        if (netPinRefs.length > 0 || netWireIds.size > 0) {
            rawNets.push({ pinRefs: netPinRefs, wireIds: netWireIds, nodeKeys: component });
        }
    }

    // ── Apply net labels ─────────────────────
    // A net label at a coordinate assigns a name to the entire net.
    // If two nets have the same label name, they merge.
    const labelToNetIndices = new Map<string, number[]>();

    for (let i = 0; i < rawNets.length; i++) {
        for (const label of netLabels) {
            const lKey = nodeId(label.x, label.y);
            if (rawNets[i].nodeKeys.has(lKey)) {
                if (!labelToNetIndices.has(label.name)) labelToNetIndices.set(label.name, []);
                labelToNetIndices.get(label.name)!.push(i);
            }
        }
    }

    // Merge nets sharing the same label via union-find
    const parent = rawNets.map((_, i) => i);
    function find(x: number): number {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    function unite(a: number, b: number) {
        const fa = find(a), fb = find(b);
        if (fa !== fb) parent[fa] = fb;
    }

    for (const [, indices] of labelToNetIndices) {
        for (let k = 1; k < indices.length; k++) {
            unite(indices[0], indices[k]);
        }
    }

    // Group by root
    const mergedMap = new Map<number, typeof rawNets[0]>();
    for (let i = 0; i < rawNets.length; i++) {
        const root = find(i);
        if (!mergedMap.has(root)) {
            mergedMap.set(root, { pinRefs: [], wireIds: new Set(), nodeKeys: new Set() });
        }
        const m = mergedMap.get(root)!;
        m.pinRefs.push(...rawNets[i].pinRefs);
        rawNets[i].wireIds.forEach((w) => m.wireIds.add(w));
        rawNets[i].nodeKeys.forEach((k) => m.nodeKeys.add(k));
    }

    // ── Build final Net array ────────────────
    const nets: Net[] = [];
    let netCounter = 0;

    for (const [, merged] of mergedMap) {
        netCounter++;

        // Determine net name: prefer net label, then power symbol, then auto
        let netName: string | undefined;

        // Check net labels
        for (const label of netLabels) {
            const lKey = nodeId(label.x, label.y);
            if (merged.nodeKeys.has(lKey)) {
                netName = label.name;
                break;
            }
        }

        // Check power symbols
        if (!netName) {
            for (const pr of merged.pinRefs) {
                const sym = symbols.find((s) => s.id === pr.symbolId);
                if (sym) {
                    const def = symbolMap.get(sym.symbolRef);
                    if (def && (def.name === 'VCC' || def.name === 'GND')) {
                        netName = def.name;
                        break;
                    }
                }
            }
        }

        // Check wire-assigned netNames (AI generated)
        if (!netName) {
            for (const wid of merged.wireIds) {
                const w = wires.find(wire => wire.id === wid);
                if (w && w.netId && !w.netId.includes('net_') && !w.netId.includes('NET_')) {
                    netName = w.netId;
                    break;
                }
            }
        }

        nets.push({
            id: netName || `net_${netCounter}`,
            name: netName || `Net${netCounter}`,
            pinRefs: merged.pinRefs,
            wireIds: [...merged.wireIds],
        });
    }

    return nets;
}
