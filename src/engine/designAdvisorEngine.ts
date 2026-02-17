/* ──────────────────────────────────────────────
   Design Advisor Engine — Real-time Insights
   ────────────────────────────────────────────── */

import {
    SchematicProject, PcbProject, DesignHint,
    SymbolInstance, Net, PcbTrace
} from '../data/types';

/**
 * Real-world BOM Data (Mock)
 */
const BOM_DATABASE = {
    'sym_resistor': { price: 0.05, bulkPrice: 0.002, moq: 1000, alt: 'Generic 0402' },
    'sym_capacitor': { price: 0.08, bulkPrice: 0.005, moq: 1000, alt: 'Generic 0603' },
    'sym_7805': { price: 0.45, bulkPrice: 0.15, moq: 100, alt: 'AMS1117-5.0' },
};

/**
 * Analyzes the current project state and returns a list of design hints.
 */
export function analyzeDesign(
    schematic: SchematicProject,
    pcb: PcbProject | undefined
): DesignHint[] {
    const hints: DesignHint[] = [];

    // ── Rule 1: Power Integrity - Decoupling ─────────
    const ics = schematic.symbols.filter(s =>
        s.properties.reference?.startsWith('U') ||
        ['sym_esp32', 'sym_tp4056', 'sym_7805'].includes(s.symbolRef)
    );

    ics.forEach(ic => {
        const hasCap = schematic.symbols.some(s =>
            s.symbolRef === 'sym_capacitor' &&
            Math.abs(s.x - ic.x) < 150 && Math.abs(s.y - ic.y) < 150
        );

        if (!hasCap) {
            hints.push({
                id: `hint_decoupling_${ic.id}`,
                severity: 'warning',
                category: 'power',
                message: `Missing decoupling for ${ic.properties.reference}`,
                description: `${ic.properties.reference} (${ic.symbolRef}) lacks a nearby 100nF decoupling capacitor. This may lead to power instability.`,
                action: { label: 'Add 100nF Cap', type: 'ADD_DECOUPLING', payload: { targetId: ic.id } }
            });
        }
    });

    // ── Rule 2: Signal Integrity - High-Speed Traces ──
    if (pcb) {
        pcb.traces.forEach(trace => {
            let length = 0;
            for (let i = 0; i < trace.points.length - 1; i++) {
                const p1 = trace.points[i];
                const p2 = trace.points[i + 1];
                length += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            }

            if (length > 150) {
                hints.push({
                    id: `hint_si_length_${trace.id}`,
                    severity: 'error',
                    category: 'si',
                    message: 'Critical Propagation Delay',
                    description: `Net ${trace.netId} length (${length.toFixed(1)}mm) exceeds 150mm. You may experience signal reflection or EMI issues.`,
                    action: { label: 'Optimize Route', type: 'OPTIMIZE_ROUTE', payload: { traceId: trace.id } }
                });
            }
        });
    }

    // ── Rule 3: Cost-Aware BOM Optimization ──────────
    const totalCost = schematic.symbols.reduce((acc, s) => {
        const data = (BOM_DATABASE as any)[s.symbolRef];
        return acc + (data?.price || 0.1);
    }, 0);

    const genericResistors = schematic.symbols.filter(s => s.symbolRef === 'sym_resistor');
    if (genericResistors.length > 5) {
        hints.push({
            id: 'hint_bom_bulk',
            severity: 'info',
            category: 'bom',
            message: 'Bulk Savings Identified',
            description: `You are using ${genericResistors.length} resistors at unit price. Switching to a volume-packed reel could save ~$${(genericResistors.length * 0.048).toFixed(2)} on this board.`,
            action: { label: 'Apply Bulk Sourcing', type: 'BOM_BULLK', payload: {} }
        });
    }

    // ── Rule 4: Design advisor generic check ─────
    if (schematic.symbols.length > 0 && schematic.wires.length === 0) {
        hints.push({
            id: 'hint_unconnected',
            severity: 'warning',
            category: 'general',
            message: 'Floating Components',
            description: 'You have placed components but they are not connected. Use the Wire tool or AI Magic to link them.',
        });
    }

    return hints;
}
