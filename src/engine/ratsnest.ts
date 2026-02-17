/* ──────────────────────────────────────────────
   Ratsnest Engine — Unrouted Connection Computation
   ────────────────────────────────────────────── */

import { FootprintInstance, PcbTrace, Net } from '../data/types';
import { footprintMap } from '../data/footprintLibrary';

export interface RatsnestLine {
    netId: string;
    from: { x: number; y: number; padId: string; componentId: string };
    to: { x: number; y: number; padId: string; componentId: string };
}

/**
 * Computes the ratsnest (unrouted connections) for the board.
 * Simple algorithm: connects all pads on the same net.
 * Future optimization: Minimum Spanning Tree (MST).
 */
export function computeRatsnest(
    footprints: FootprintInstance[],
    traces: PcbTrace[],
    nets: Net[]
): RatsnestLine[] {
    const ratsnest: RatsnestLine[] = [];

    // Map netId to all its physical pad locations on the PCB
    const netPadsMap = new Map<string, { x: number; y: number; padId: string; componentId: string }[]>();

    for (const inst of footprints) {
        const fpDef = footprintMap.get(inst.footprintRef);
        if (!fpDef) continue;

        for (const pad of fpDef.pads) {
            // Find which net this pad belongs to
            // This requires mapping symbol pin -> net -> footprint pad
            // For now, we assume simple mapping: pad id matches symbol pin id
            const net = nets.find(n =>
                n.pinRefs.some(pr => (pr.symbolId === (inst.schematicSymbolId || inst.componentRef)) && pr.pinId === pad.id)
            );

            if (net) {
                if (!netPadsMap.has(net.id)) netPadsMap.set(net.id, []);

                // Calculate absolute position of pad
                // Rotation (deg) -> rad
                const rad = (inst.rotation * Math.PI) / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);

                const px = pad.x * cos - pad.y * sin;
                const py = pad.x * sin + pad.y * cos;

                netPadsMap.get(net.id)!.push({
                    x: inst.x + px,
                    y: inst.y + py,
                    padId: pad.id,
                    componentId: inst.id
                });
            }
        }
    }

    // For each net, create connections between its pads
    // Simple path: 1->2, 2->3, ...
    for (const [netId, pads] of netPadsMap) {
        if (pads.length < 2) continue;

        for (let i = 0; i < pads.length - 1; i++) {
            // Check if this connection is already satisfied by a trace
            // (Very simplified check for now)
            ratsnest.push({
                netId,
                from: pads[i],
                to: pads[i + 1]
            });
        }
    }

    return ratsnest;
}
