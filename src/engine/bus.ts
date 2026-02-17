/* ──────────────────────────────────────────────
   Bus Engine — Bus label parsing, expansion, and connectivity
   ────────────────────────────────────────────── */

import { BusLabel, BusEntry, Wire, Net } from '../data/types';

/**
 * Parse a bus label string like "DATA[0..7]" into a BusLabel object.
 * Supports: SIGNAL[start..end]
 * Returns null if the string is not a valid bus label.
 */
export function parseBusLabel(label: string): BusLabel | null {
    const match = label.match(/^([A-Za-z_][A-Za-z0-9_]*)\[(\d+)\.\.(\d+)\]$/);
    if (!match) return null;
    const name = match[1];
    const rangeStart = parseInt(match[2], 10);
    const rangeEnd = parseInt(match[3], 10);
    if (isNaN(rangeStart) || isNaN(rangeEnd)) return null;
    return { name, rangeStart, rangeEnd };
}

/**
 * Expand a bus label into individual indexed net names.
 * e.g. { name: "DATA", rangeStart: 0, rangeEnd: 7 }
 *      → ["DATA0", "DATA1", ..., "DATA7"]
 */
export function expandBus(bus: BusLabel): string[] {
    const names: string[] = [];
    const start = Math.min(bus.rangeStart, bus.rangeEnd);
    const end = Math.max(bus.rangeStart, bus.rangeEnd);
    for (let i = start; i <= end; i++) {
        names.push(`${bus.name}${i}`);
    }
    return names;
}

/**
 * Expand a bus label string directly.
 * Returns empty array if not a valid bus label.
 */
export function expandBusLabel(label: string): string[] {
    const parsed = parseBusLabel(label);
    if (!parsed) return [];
    return expandBus(parsed);
}

/**
 * Get the width (number of members) of a bus.
 */
export function busWidth(bus: BusLabel): number {
    return Math.abs(bus.rangeEnd - bus.rangeStart) + 1;
}

/**
 * Connect bus entries to their corresponding individual indexed nets.
 * A BusEntry at a position connects the bus wire to a specific member net.
 *
 * Returns a map: memberNetName → list of { x, y } connection points.
 */
export function resolveBusEntries(
    busEntries: BusEntry[],
    busWires: Wire[]
): Map<string, { x: number; y: number }[]> {
    const connections = new Map<string, { x: number; y: number }[]>();

    for (const entry of busEntries) {
        // Verify the bus exists by checking if any bus wire has a matching label
        const busLabel = busWires.find((w) => {
            if (!w.busLabel) return false;
            const parsed = parseBusLabel(w.busLabel);
            return parsed && parsed.name === entry.busNetName;
        })?.busLabel;

        if (!busLabel) continue;
        const parsed = parseBusLabel(busLabel);
        if (!parsed) continue;

        // Validate the member index is within range
        const start = Math.min(parsed.rangeStart, parsed.rangeEnd);
        const end = Math.max(parsed.rangeStart, parsed.rangeEnd);
        if (entry.memberIndex < start || entry.memberIndex > end) continue;

        const memberNetName = `${entry.busNetName}${entry.memberIndex}`;
        if (!connections.has(memberNetName)) connections.set(memberNetName, []);
        connections.get(memberNetName)!.push({ x: entry.x, y: entry.y });
    }

    return connections;
}

/**
 * Get all bus wire labels from the wire list.
 */
export function getAllBusLabels(wires: Wire[]): BusLabel[] {
    const labels: BusLabel[] = [];
    const seen = new Set<string>();
    for (const wire of wires) {
        if (wire.isBus && wire.busLabel && !seen.has(wire.busLabel)) {
            const parsed = parseBusLabel(wire.busLabel);
            if (parsed) {
                labels.push(parsed);
                seen.add(wire.busLabel);
            }
        }
    }
    return labels;
}

/**
 * Format a BusLabel back to its string representation.
 */
export function formatBusLabel(bus: BusLabel): string {
    return `${bus.name}[${bus.rangeStart}..${bus.rangeEnd}]`;
}
