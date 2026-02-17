/* ──────────────────────────────────────────────
   ERC — Electrical Rules Check Engine
   Rules 1–10 covering pin, power, net, hierarchy, and bus checks
   ────────────────────────────────────────────── */

import {
    SymbolInstance,
    Wire,
    Net,
    ErcViolation,
    Junction,
    NetLabel,
    SheetPort,
    SheetInstance,
    SheetDef,
    BusEntry,
} from '../data/types';
import { symbolMap } from '../data/symbolLibrary';
import { computeNets, getPinAbsolutePosition } from './connectivity';

let violationCounter = 0;

function makeViolation(
    severity: ErcViolation['severity'],
    message: string,
    extras?: Partial<ErcViolation>
): ErcViolation {
    violationCounter++;
    return {
        id: `erc_${violationCounter}`,
        severity,
        message,
        ...extras,
    };
}

/**
 * Run all ERC checks and return violations.
 */
export function runErc(
    symbols: SymbolInstance[],
    wires: Wire[],
    junctions: Junction[] = [],
    netLabels: NetLabel[] = [],
    sheetPorts: SheetPort[] = [],
    sheetInstances: SheetInstance[] = [],
    sheetDefs: SheetDef[] = [],
    busEntries: BusEntry[] = [],
    sheetPath: string = '/'
): ErcViolation[] {
    violationCounter = 0;
    const violations: ErcViolation[] = [];
    const nets = computeNets(symbols, wires, junctions, netLabels);

    // Build a set of all connected pin refs for quick lookup
    const connectedPins = new Set<string>();
    for (const net of nets) {
        if (net.pinRefs.length > 1 || net.wireIds.length > 0) {
            for (const pr of net.pinRefs) {
                connectedPins.add(`${pr.symbolId}::${pr.pinId}`);
            }
        }
    }

    // ── Rule 1: Unconnected Pins ──────────────
    for (const sym of symbols) {
        const def = symbolMap.get(sym.symbolRef);
        if (!def) continue;
        for (const pin of def.pins) {
            const key = `${sym.id}::${pin.id}`;
            if (!connectedPins.has(key)) {
                violations.push(
                    makeViolation('warning', `Unconnected pin: ${sym.properties.reference}.${pin.name}`, {
                        symbolIds: [sym.id],
                        pinRefs: [{ symbolId: sym.id, pinId: pin.id }],
                        sheetPath,
                    })
                );
            }
        }
    }

    // ── Rule 2: Power pin not on power net ────
    for (const sym of symbols) {
        const def = symbolMap.get(sym.symbolRef);
        if (!def) continue;
        for (const pin of def.pins) {
            if (pin.electricalType === 'power_in') {
                const pinNet = nets.find((n) =>
                    n.pinRefs.some((pr) => pr.symbolId === sym.id && pr.pinId === pin.id)
                );
                if (!pinNet) {
                    violations.push(
                        makeViolation('error', `Power input pin ${sym.properties.reference}.${pin.name} not connected to any net`, {
                            symbolIds: [sym.id],
                            pinRefs: [{ symbolId: sym.id, pinId: pin.id }],
                            sheetPath,
                        })
                    );
                } else {
                    const hasPowerSource = pinNet.pinRefs.some((pr) => {
                        const s = symbols.find((ss) => ss.id === pr.symbolId);
                        if (!s) return false;
                        const d = symbolMap.get(s.symbolRef);
                        if (!d) return false;
                        const p = d.pins.find((pp) => pp.id === pr.pinId);
                        return p && p.electricalType === 'power_out';
                    });
                    if (!hasPowerSource) {
                        violations.push(
                            makeViolation('warning', `Power input pin ${sym.properties.reference}.${pin.name} not connected to power source`, {
                                symbolIds: [sym.id],
                                pinRefs: [{ symbolId: sym.id, pinId: pin.id }],
                                sheetPath,
                            })
                        );
                    }
                }
            }
        }
    }

    // ── Rule 3: Output-to-output conflict ─────
    for (const net of nets) {
        const outputs: { symbolId: string; pinId: string; ref: string; pinName: string }[] = [];
        for (const pr of net.pinRefs) {
            const sym = symbols.find((s) => s.id === pr.symbolId);
            if (!sym) continue;
            const def = symbolMap.get(sym.symbolRef);
            if (!def) continue;
            const pin = def.pins.find((p) => p.id === pr.pinId);
            if (pin && pin.electricalType === 'output') {
                outputs.push({
                    symbolId: pr.symbolId,
                    pinId: pr.pinId,
                    ref: sym.properties.reference,
                    pinName: pin.name,
                });
            }
        }
        if (outputs.length > 1) {
            violations.push(
                makeViolation(
                    'error',
                    `Output-to-output conflict on ${net.name}: ${outputs.map((o) => `${o.ref}.${o.pinName}`).join(', ')}`,
                    { symbolIds: outputs.map((o) => o.symbolId), sheetPath }
                )
            );
        }
    }

    // ── Rule 4: Missing reference designator ──
    for (const sym of symbols) {
        if (!sym.properties.reference || sym.properties.reference.trim() === '') {
            violations.push(
                makeViolation('error', `Missing reference designator for symbol at (${sym.x}, ${sym.y})`, {
                    symbolIds: [sym.id],
                    sheetPath,
                })
            );
        }
    }

    // ── Rule 5: Duplicate reference designator ─
    const refCount = new Map<string, string[]>();
    for (const sym of symbols) {
        const ref = sym.properties.reference;
        if (ref) {
            if (!refCount.has(ref)) refCount.set(ref, []);
            refCount.get(ref)!.push(sym.id);
        }
    }
    for (const [ref, ids] of refCount) {
        if (ids.length > 1) {
            violations.push(
                makeViolation('error', `Duplicate reference designator: ${ref}`, {
                    symbolIds: ids,
                    sheetPath,
                })
            );
        }
    }

    // ── Rule 6: Floating net labels ───────────
    for (const label of netLabels) {
        const labelOnNet = nets.some((n) => n.name === label.name && (n.pinRefs.length > 0 || n.wireIds.length > 0));
        if (!labelOnNet) {
            violations.push(
                makeViolation('warning', `Net label "${label.name}" at (${label.x}, ${label.y}) is not connected to any wire or pin`, {
                    sheetPath,
                })
            );
        }
    }

    // ── Rule 7: Multiple drivers detection ────
    // Extension of Rule 3 — includes power_out pins as potential drivers
    for (const net of nets) {
        const drivers: { ref: string; pinName: string; type: string }[] = [];
        for (const pr of net.pinRefs) {
            const sym = symbols.find((s) => s.id === pr.symbolId);
            if (!sym) continue;
            const def = symbolMap.get(sym.symbolRef);
            if (!def) continue;
            const pin = def.pins.find((p) => p.id === pr.pinId);
            if (pin && (pin.electricalType === 'output' || pin.electricalType === 'power_out')) {
                drivers.push({
                    ref: sym.properties.reference,
                    pinName: pin.name,
                    type: pin.electricalType,
                });
            }
        }
        // Only flag if there are multiple drivers of the same type on non-power nets
        const outputDrivers = drivers.filter((d) => d.type === 'output');
        const powerDrivers = drivers.filter((d) => d.type === 'power_out');
        if (outputDrivers.length > 1) {
            // Already caught by Rule 3, but we add power awareness
        }
        if (powerDrivers.length > 1 && outputDrivers.length > 0) {
            violations.push(
                makeViolation(
                    'error',
                    `Multiple drivers on net ${net.name}: ${drivers.map((d) => `${d.ref}.${d.pinName} (${d.type})`).join(', ')}`,
                    { sheetPath }
                )
            );
        }
    }

    // ── Rule 8: Unused net ────────────────────
    // A net with wires but zero pin connections is "unused"
    for (const net of nets) {
        if (net.wireIds.length > 0 && net.pinRefs.length === 0) {
            violations.push(
                makeViolation('warning', `Unused net "${net.name || net.id}" has wires but no pin connections`, {
                    wireIds: net.wireIds,
                    sheetPath,
                })
            );
        }
    }

    // ── Rule 9: Unconnected sheet ports ───────
    for (const port of sheetPorts) {
        const portConnected = nets.some(
            (n) => n.name === port.name && (n.pinRefs.length > 0 || n.wireIds.length > 0)
        );
        if (!portConnected) {
            violations.push(
                makeViolation('error', `Sheet port "${port.name}" is not connected to any net`, {
                    sheetPath,
                })
            );
        }
    }

    // Also check child sheet instances — their ports should match parent connections
    for (const sheetInst of sheetInstances) {
        const childDef = sheetDefs.find((sd) => sd.id === sheetInst.sheetDefId);
        if (!childDef) continue;
        for (const childPort of childDef.sheetPorts) {
            const parentNetExists = nets.some((n) => n.name === childPort.name);
            if (!parentNetExists) {
                violations.push(
                    makeViolation('warning', `Sheet "${sheetInst.name}" port "${childPort.name}" has no matching net on parent sheet`, {
                        sheetPath,
                    })
                );
            }
        }
    }

    // ── Rule 10: Power flag rule ──────────────
    // A net with power_in pins must have either a power_out pin or a power flag symbol
    for (const net of nets) {
        const hasPowerIn = net.pinRefs.some((pr) => {
            const sym = symbols.find((s) => s.id === pr.symbolId);
            if (!sym) return false;
            const def = symbolMap.get(sym.symbolRef);
            if (!def) return false;
            const pin = def.pins.find((p) => p.id === pr.pinId);
            return pin && pin.electricalType === 'power_in';
        });

        if (!hasPowerIn) continue;

        const hasPowerOut = net.pinRefs.some((pr) => {
            const sym = symbols.find((s) => s.id === pr.symbolId);
            if (!sym) return false;
            const def = symbolMap.get(sym.symbolRef);
            if (!def) return false;
            const pin = def.pins.find((p) => p.id === pr.pinId);
            return pin && pin.electricalType === 'power_out';
        });

        const hasPowerFlag = net.pinRefs.some((pr) => {
            const sym = symbols.find((s) => s.id === pr.symbolId);
            if (!sym) return false;
            const def = symbolMap.get(sym.symbolRef);
            if (!def) return false;
            return def.category === 'Power';
        });

        if (!hasPowerOut && !hasPowerFlag) {
            violations.push(
                makeViolation(
                    'warning',
                    `Net "${net.name || net.id}" has power input pins but no power source or power flag`,
                    { sheetPath }
                )
            );
        }
    }

    return violations;
}
