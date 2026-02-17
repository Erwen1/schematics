/* ──────────────────────────────────────────────
   DRC Engine — Design Rule Checking
   ────────────────────────────────────────────── */

import { PcbProject, PcbViolation, FootprintInstance, Net, NetClass } from '../data/types';
import { footprintMap } from '../data/footprintLibrary';

export function runPcbDrc(
    project: PcbProject,
    nets: Net[],
    netClasses: NetClass[]
): PcbViolation[] {
    const violations: PcbViolation[] = [];

    // ── Rule 1: Minimum Trace Width ───────────
    for (const trace of project.traces) {
        const net = nets.find(n => n.id === trace.netId);
        const nc = netClasses.find(c => c.id === net?.netClassId);
        const minWidth = nc?.constraints.traceWidth ?? 10;

        if (trace.width < minWidth) {
            violations.push({
                id: `v_width_${trace.id}`,
                severity: 'error',
                message: `Trace width ${trace.width} is below minimum ${minWidth} for net class ${nc?.name ?? 'Default'}`,
                points: trace.points
            });
        }
    }

    // ── Rule 2: Minimum Via Drill ────────────
    for (const via of project.vias) {
        const net = nets.find(n => n.id === via.netId);
        const nc = netClasses.find(c => c.id === net?.netClassId);
        const minDrill = nc?.constraints.viaDrill ?? 12;

        if (via.drill < minDrill) {
            violations.push({
                id: `v_drill_${via.id}`,
                severity: 'error',
                message: `Via drill ${via.drill} is below minimum ${minDrill}`,
                points: [{ x: via.x, y: via.y }]
            });
        }
    }

    // ── Rule 3: Clearance (Simplified) ────────
    // Real DRC would use sweep-line or spatial hashing
    // Here we just placeholder the structure

    return violations;
}
