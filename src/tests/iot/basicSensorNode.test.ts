/* ──────────────────────────────────────────────────────────────────────
   Basic Sensor Node — Comprehensive Wiring Validation
   IoT Test Page ▸ Project Selector #1: "Basic Sensor Node"
   Template: ESP32 + BME280 + LM1117 + Pull-ups + Decoupling Caps
   ────────────────────────────────────────────────────────────────────── */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { computeNets } from '../../engine/connectivity';
import { runErc } from '../../engine/erc';
import { symbolMap } from '../../data/symbolLibrary';
import { SymbolInstance, Wire, Net } from '../../data/types';
import { getPinAbsolutePosition } from '../../engine/connectivity';

/* ──────────────────────────── Shared state ─────────────────────────── */

// Use exactly the same prompt as the IoT playground project selector
const PROMPT = 'Create ESP32 with BME280 I2C sensor, 4.7k pullups and 3.3V power';

let symbols: SymbolInstance[];
let wires: Wire[];
let nets: Net[];

beforeAll(() => {
    const result = generateFromPrompt(PROMPT);
    symbols = result.symbols;
    wires = result.wires;
    nets = computeNets(symbols, wires);
});

/* ═══════════════════════════════════════════════════════════════════════
   1. COMPONENT INSTANTIATION
   ═══════════════════════════════════════════════════════════════════════ */

describe('1 — Component Instantiation', () => {

    it('should generate exactly 10 symbols', () => {
        expect(symbols.length).toBe(10);
    });

    it('should contain one ESP32', () => {
        const esp32s = symbols.filter(s => s.symbolRef === 'sym_esp32');
        expect(esp32s.length).toBe(1);
        expect(esp32s[0].properties.reference).toBe('U1');
    });

    it('should contain one BME280', () => {
        const bme = symbols.filter(s => s.symbolRef === 'sym_bme280');
        expect(bme.length).toBe(1);
        expect(bme[0].properties.reference).toBe('U2');
    });

    it('should contain one LM1117 voltage regulator', () => {
        const reg = symbols.filter(s => s.symbolRef === 'sym_lm1117');
        expect(reg.length).toBe(1);
        expect(reg[0].properties.reference).toBe('REG1');
    });

    it('should contain two pull-up resistors', () => {
        const resistors = symbols.filter(s => s.symbolRef === 'sym_resistor');
        expect(resistors.length).toBe(2);
        const refs = resistors.map(r => r.properties.reference).sort();
        expect(refs).toEqual(['R_PU1', 'R_PU2']);
    });

    it('should contain three capacitors (two decoupling + input)', () => {
        const caps = symbols.filter(s => s.symbolRef === 'sym_capacitor');
        expect(caps.length).toBe(3);
        const refs = caps.map(c => c.properties.reference).sort();
        expect(refs).toEqual(['C_DEC1', 'C_DEC2', 'C_IN']);
    });

    it('should contain a GND power flag symbol', () => {
        const gndFlags = symbols.filter(s => s.symbolRef === 'sym_gnd');
        expect(gndFlags.length).toBe(1);
        expect(gndFlags[0].properties.reference).toBe('PWR_GND');
    });

    it('should contain a VIN power flag symbol', () => {
        const vinFlags = symbols.filter(s => s.symbolRef === 'sym_pwr_flag');
        expect(vinFlags.length).toBe(1);
        expect(vinFlags[0].properties.reference).toBe('PWR_VIN');
    });

    it('should have unique reference designators (no duplicates)', () => {
        const refs = symbols.map(s => s.properties.reference);
        const uniqueRefs = new Set(refs);
        expect(uniqueRefs.size).toBe(refs.length);
    });

    it('should have no empty reference designators', () => {
        for (const sym of symbols) {
            expect(sym.properties.reference).toBeTruthy();
            expect(sym.properties.reference.trim().length).toBeGreaterThan(0);
        }
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   2. WIRE INTEGRITY
   ═══════════════════════════════════════════════════════════════════════ */

describe('2 — Wire Integrity', () => {

    it('should generate exactly 18 wires', () => {
        expect(wires.length).toBe(18);
    });

    it('should have no self-wires (from-pin === to-pin)', () => {
        for (const wire of wires) {
            const first = wire.points[0];
            const last = wire.points[wire.points.length - 1];
            // A wire that starts and ends at the exact same point is a self-wire
            const isSelfWire = first.x === last.x && first.y === last.y;
            expect(isSelfWire, `Wire ${wire.id} (net: ${wire.netId}) is a self-wire at (${first.x}, ${first.y})`).toBe(false);
        }
    });

    it('should have no zero-length wires', () => {
        for (const wire of wires) {
            expect(wire.points.length, `Wire ${wire.id} has fewer than 2 points`).toBeGreaterThanOrEqual(2);

            // Total path length should be > 0
            let totalLength = 0;
            for (let i = 0; i < wire.points.length - 1; i++) {
                const dx = wire.points[i + 1].x - wire.points[i].x;
                const dy = wire.points[i + 1].y - wire.points[i].y;
                totalLength += Math.sqrt(dx * dx + dy * dy);
            }
            expect(totalLength, `Wire ${wire.id} (net: ${wire.netId}) has zero path length`).toBeGreaterThan(0);
        }
    });

    it('every wire should have a net label assigned', () => {
        for (const wire of wires) {
            expect(wire.netId, `Wire ${wire.id} has no netId`).toBeTruthy();
        }
    });

    it('should only use expected net names on wires', () => {
        const allowedNets = new Set(['3V3', 'GND', 'SDA', 'SCL', 'VIN']);
        for (const wire of wires) {
            expect(allowedNets.has(wire.netId!), `Wire ${wire.id} has unexpected net "${wire.netId}"`).toBe(true);
        }
    });

    it('should have correct wire count per net', () => {
        const netCounts = new Map<string, number>();
        for (const wire of wires) {
            netCounts.set(wire.netId!, (netCounts.get(wire.netId!) || 0) + 1);
        }
        // 3V3: REG1→U1, U1→C_DEC1, U1→U2, U2→C_DEC2, U1→R_PU1, R_PU1→R_PU2 = 6
        // GND: C_IN→REG1, C_DEC1→U1, C_DEC2→U2, REG1→U1, U1→U2, PWR_GND→U1 = 6
        // SDA: U1→U2, R_PU1→U2 = 2
        // SCL: U1→U2, R_PU2→U2 = 2
        // VIN: PWR_VIN→C_IN, REG1→C_IN = 2
        expect(netCounts.get('3V3')).toBe(6);
        expect(netCounts.get('GND')).toBe(6);
        expect(netCounts.get('SDA')).toBe(2);
        expect(netCounts.get('SCL')).toBe(2);
        expect(netCounts.get('VIN')).toBe(2);
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   3. NET CONNECTIVITY (computeNets validation)
   ═══════════════════════════════════════════════════════════════════════ */

describe('3 — Net Connectivity', () => {

    it('should compute nets successfully', () => {
        expect(nets).toBeDefined();
        expect(nets.length).toBeGreaterThan(0);
    });

    it('should have 3V3, GND, SDA, SCL nets', () => {
        const netNames = nets.map(n => n.name);
        const netIds = nets.map(n => n.id);
        const all = [...netNames, ...netIds];

        expect(all).toContain('3V3');
        expect(all).toContain('GND');
        expect(all).toContain('SDA');
        expect(all).toContain('SCL');
    });

    it('3V3 net should connect REG1.OUT, U1.3V3, U2.VCC, C_DEC1.p1, C_DEC2.p1, R_PU1.p1, R_PU2.p1', () => {
        const net3v3 = nets.find(n => n.name === '3V3' || n.id === '3V3');
        expect(net3v3).toBeDefined();

        // Identify which symbol IDs correspond to which refs
        const reg1 = symbols.find(s => s.properties.reference === 'REG1')!;
        const u1 = symbols.find(s => s.properties.reference === 'U1')!;
        const u2 = symbols.find(s => s.properties.reference === 'U2')!;
        const cDec1 = symbols.find(s => s.properties.reference === 'C_DEC1')!;
        const cDec2 = symbols.find(s => s.properties.reference === 'C_DEC2')!;
        const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1')!;
        const rPu2 = symbols.find(s => s.properties.reference === 'R_PU2')!;

        const pinRefs = net3v3!.pinRefs;
        const pinKeys = pinRefs.map(pr => `${pr.symbolId}::${pr.pinId}`);

        expect(pinKeys).toContain(`${reg1.id}::out`);
        expect(pinKeys).toContain(`${u1.id}::3v3`);
        expect(pinKeys).toContain(`${u2.id}::vcc`);
        expect(pinKeys).toContain(`${cDec1.id}::p1`);
        expect(pinKeys).toContain(`${cDec2.id}::p1`);
        expect(pinKeys).toContain(`${rPu1.id}::p1`);
        expect(pinKeys).toContain(`${rPu2.id}::p1`);
    });

    it('GND net should connect REG1.GND, U1.GND, U2.GND, C_DEC1.p2, C_DEC2.p2, C_IN.p2, PWR_GND.p1', () => {
        const netGnd = nets.find(n => n.name === 'GND' || n.id === 'GND');
        expect(netGnd).toBeDefined();

        const reg1 = symbols.find(s => s.properties.reference === 'REG1')!;
        const u1 = symbols.find(s => s.properties.reference === 'U1')!;
        const u2 = symbols.find(s => s.properties.reference === 'U2')!;
        const cDec1 = symbols.find(s => s.properties.reference === 'C_DEC1')!;
        const cDec2 = symbols.find(s => s.properties.reference === 'C_DEC2')!;
        const cIn = symbols.find(s => s.properties.reference === 'C_IN')!;
        const pwrGnd = symbols.find(s => s.properties.reference === 'PWR_GND')!;

        const pinKeys = netGnd!.pinRefs.map(pr => `${pr.symbolId}::${pr.pinId}`);

        expect(pinKeys).toContain(`${reg1.id}::gnd`);
        expect(pinKeys).toContain(`${u1.id}::gnd`);
        expect(pinKeys).toContain(`${u2.id}::gnd`);
        expect(pinKeys).toContain(`${cDec1.id}::p2`);
        expect(pinKeys).toContain(`${cDec2.id}::p2`);
        expect(pinKeys).toContain(`${cIn.id}::p2`);
        expect(pinKeys).toContain(`${pwrGnd.id}::p1`);
    });

    it('SDA net should connect U1.GPIO21, U2.SDA, R_PU1.p2', () => {
        const netSda = nets.find(n => n.name === 'SDA' || n.id === 'SDA');
        expect(netSda).toBeDefined();

        const u1 = symbols.find(s => s.properties.reference === 'U1')!;
        const u2 = symbols.find(s => s.properties.reference === 'U2')!;
        const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1')!;

        const pinKeys = netSda!.pinRefs.map(pr => `${pr.symbolId}::${pr.pinId}`);

        expect(pinKeys).toContain(`${u1.id}::gpio21`);
        expect(pinKeys).toContain(`${u2.id}::sda`);
        expect(pinKeys).toContain(`${rPu1.id}::p2`);
    });

    it('SCL net should connect U1.GPIO22, U2.SCL, R_PU2.p2', () => {
        const netScl = nets.find(n => n.name === 'SCL' || n.id === 'SCL');
        expect(netScl).toBeDefined();

        const u1 = symbols.find(s => s.properties.reference === 'U1')!;
        const u2 = symbols.find(s => s.properties.reference === 'U2')!;
        const rPu2 = symbols.find(s => s.properties.reference === 'R_PU2')!;

        const pinKeys = netScl!.pinRefs.map(pr => `${pr.symbolId}::${pr.pinId}`);

        expect(pinKeys).toContain(`${u1.id}::gpio22`);
        expect(pinKeys).toContain(`${u2.id}::scl`);
        expect(pinKeys).toContain(`${rPu2.id}::p2`);
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   4. SPATIAL INTEGRITY (No overlaps, no wire-through-body)
   ═══════════════════════════════════════════════════════════════════════ */

describe('4 — Spatial Integrity', () => {

    it('no two components should physically overlap', () => {
        for (let i = 0; i < symbols.length; i++) {
            for (let j = i + 1; j < symbols.length; j++) {
                const s1 = symbols[i];
                const s2 = symbols[j];
                const d1 = symbolMap.get(s1.symbolRef)!;
                const d2 = symbolMap.get(s2.symbolRef)!;

                const r1 = { x: s1.x, y: s1.y, w: d1.width, h: d1.height };
                const r2 = { x: s2.x, y: s2.y, w: d2.width, h: d2.height };

                const overlaps =
                    r1.x < r2.x + r2.w &&
                    r1.x + r1.w > r2.x &&
                    r1.y < r2.y + r2.h &&
                    r1.y + r1.h > r2.y;

                expect(
                    overlaps,
                    `${s1.properties.reference} overlaps ${s2.properties.reference}`
                ).toBe(false);
            }
        }
    });

    it('no wire segment should pass through a component body (no tunneling)', () => {
        const obstacles = symbols.map(s => {
            const def = symbolMap.get(s.symbolRef)!;
            return { id: s.id, ref: s.properties.reference, x: s.x, y: s.y, w: def.width, h: def.height };
        });

        for (const wire of wires) {
            for (let i = 0; i < wire.points.length - 1; i++) {
                const p1 = wire.points[i];
                const p2 = wire.points[i + 1];

                for (const obs of obstacles) {
                    // Shrink the body by a margin for the interior check
                    const margin = 10;
                    const body = {
                        x: obs.x + margin,
                        y: obs.y + margin,
                        w: obs.w - 2 * margin,
                        h: obs.h - 2 * margin
                    };

                    // Skip if the wire starts/ends at this component (pin lead-out)
                    const isSource = isWireEndpointOnComponent(wire, obs);
                    if (isSource) continue;

                    // Skip bodies too small after margin shrink
                    if (body.w <= 0 || body.h <= 0) continue;

                    const minX = Math.min(p1.x, p2.x);
                    const maxX = Math.max(p1.x, p2.x);
                    const minY = Math.min(p1.y, p2.y);
                    const maxY = Math.max(p1.y, p2.y);

                    let intersects = false;
                    if (p1.y === p2.y) {
                        // Horizontal segment
                        intersects =
                            p1.y > body.y && p1.y < body.y + body.h &&
                            maxX > body.x + margin && minX < body.x + body.w - margin;
                    } else if (p1.x === p2.x) {
                        // Vertical segment
                        intersects =
                            p1.x > body.x && p1.x < body.x + body.w &&
                            maxY > body.y + margin && minY < body.y + body.h - margin;
                    }

                    expect(
                        intersects,
                        `Wire ${wire.netId} segment ${i} (${p1.x},${p1.y})→(${p2.x},${p2.y}) tunnels through ${obs.ref}`
                    ).toBe(false);
                }
            }
        }
    });
});

/** Check if any endpoint of a wire is near a component's pins */
function isWireEndpointOnComponent(wire: Wire, obs: { id: string; x: number; y: number; w: number; h: number }): boolean {
    const sym = symbols.find(s => s.id === obs.id);
    if (!sym) return false;
    const def = symbolMap.get(sym.symbolRef);
    if (!def) return false;

    const first = wire.points[0];
    const last = wire.points[wire.points.length - 1];

    for (const pin of def.pins) {
        const pos = getPinAbsolutePosition(sym, pin);
        if ((Math.abs(first.x - pos.x) < 5 && Math.abs(first.y - pos.y) < 5) ||
            (Math.abs(last.x - pos.x) < 5 && Math.abs(last.y - pos.y) < 5)) {
            return true;
        }
    }
    return false;
}

/* ═══════════════════════════════════════════════════════════════════════
   5. WIRE ENDPOINT ACCURACY (wires land on actual pin positions)
   ═══════════════════════════════════════════════════════════════════════ */

describe('5 — Wire Endpoint Pin Accuracy', () => {

    it('every wire should start and end at a valid pin position', () => {
        // Collect all absolute pin positions
        const pinPositions: { x: number; y: number; ref: string; pin: string }[] = [];
        for (const sym of symbols) {
            const def = symbolMap.get(sym.symbolRef);
            if (!def) continue;
            for (const pin of def.pins) {
                const pos = getPinAbsolutePosition(sym, pin);
                pinPositions.push({ x: pos.x, y: pos.y, ref: sym.properties.reference, pin: pin.id });
            }
        }

        const TOLERANCE = 5; // pixels

        for (const wire of wires) {
            const first = wire.points[0];
            const last = wire.points[wire.points.length - 1];

            const startsAtPin = pinPositions.some(
                p => Math.abs(p.x - first.x) < TOLERANCE && Math.abs(p.y - first.y) < TOLERANCE
            );
            const endsAtPin = pinPositions.some(
                p => Math.abs(p.x - last.x) < TOLERANCE && Math.abs(p.y - last.y) < TOLERANCE
            );

            expect(
                startsAtPin,
                `Wire ${wire.netId} (${wire.id}) start (${first.x}, ${first.y}) is not at any pin`
            ).toBe(true);
            expect(
                endsAtPin,
                `Wire ${wire.netId} (${wire.id}) end (${last.x}, ${last.y}) is not at any pin`
            ).toBe(true);
        }
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   6. ERC VALIDATION (Electrical Rules Check)
   ═══════════════════════════════════════════════════════════════════════ */

describe('6 — ERC Validation', () => {

    it('should produce zero error-severity violations', () => {
        const violations = runErc(symbols, wires);
        const errors = violations.filter(v => v.severity === 'error');

        if (errors.length > 0) {
            console.log('ERC ERRORS:');
            errors.forEach(e => console.log(`  [ERROR] ${e.message}`));
        }

        expect(errors.length).toBe(0);
    });

    it('should have no output-to-output conflicts (ERC Rule 3)', () => {
        const violations = runErc(symbols, wires);
        const conflicts = violations.filter(v => v.message.includes('Output-to-output'));
        expect(conflicts.length).toBe(0);
    });

    it('should have no duplicate reference designators (ERC Rule 5)', () => {
        const violations = runErc(symbols, wires);
        const dupes = violations.filter(v => v.message.includes('Duplicate reference'));
        expect(dupes.length).toBe(0);
    });

    it('should flag unconnected pins as warnings (not errors)', () => {
        const violations = runErc(symbols, wires);
        const unconnectedErrors = violations.filter(
            v => v.message.includes('Unconnected pin') && v.severity === 'error'
        );
        expect(unconnectedErrors.length).toBe(0);
    });

    it('should produce zero warnings after NC flags are applied', () => {
        const violations = runErc(symbols, wires);
        const warnings = violations.filter(v => v.severity === 'warning');
        if (warnings.length > 0) {
            console.log('ERC WARNINGS:');
            warnings.forEach(w => console.log(`  [WARN] ${w.message}`));
        }
        expect(warnings.length).toBe(0);
    });

    it('NC-flagged pins should not generate unconnected warnings', () => {
        const u1 = symbols.find(s => s.properties.reference === 'U1')!;
        const u2 = symbols.find(s => s.properties.reference === 'U2')!;
        expect(u1.noConnectPinIds).toBeDefined();
        expect(u2.noConnectPinIds).toBeDefined();
        expect(u1.noConnectPinIds!.length).toBe(16); // 16 unused GPIOs
        expect(u2.noConnectPinIds!.length).toBe(2);  // CSB, SDO

        const violations = runErc(symbols, wires);
        const u1Unconnected = violations.filter(
            v => v.message.includes('U1.') && v.message.includes('Unconnected')
        );
        const u2Unconnected = violations.filter(
            v => v.message.includes('U2.') && v.message.includes('Unconnected')
        );
        expect(u1Unconnected.length).toBe(0);
        expect(u2Unconnected.length).toBe(0);
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   7. DETERMINISM (Same prompt → same output)
   ═══════════════════════════════════════════════════════════════════════ */

describe('7 — Determinism', () => {

    it('should produce identical symbol count for same prompt', () => {
        const r1 = generateFromPrompt(PROMPT);
        const r2 = generateFromPrompt(PROMPT);
        expect(r1.symbols.length).toBe(r2.symbols.length);
    });

    it('should produce identical wire count for same prompt', () => {
        const r1 = generateFromPrompt(PROMPT);
        const r2 = generateFromPrompt(PROMPT);
        expect(r1.wires.length).toBe(r2.wires.length);
    });

    it('should produce identical net assignments for same prompt', () => {
        const r1 = generateFromPrompt(PROMPT);
        const r2 = generateFromPrompt(PROMPT);

        const nets1 = r1.wires.map(w => w.netId).sort();
        const nets2 = r2.wires.map(w => w.netId).sort();
        expect(nets1).toEqual(nets2);
    });

    it('should produce identical symbol refs for same prompt', () => {
        const r1 = generateFromPrompt(PROMPT);
        const r2 = generateFromPrompt(PROMPT);

        const refs1 = r1.symbols.map(s => s.symbolRef).sort();
        const refs2 = r2.symbols.map(s => s.symbolRef).sort();
        expect(refs1).toEqual(refs2);
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   8. PERFORMANCE
   ═══════════════════════════════════════════════════════════════════════ */

describe('8 — Performance', () => {

    it('generation should complete under 100ms', () => {
        const start = performance.now();
        generateFromPrompt(PROMPT);
        const elapsed = performance.now() - start;
        console.log(`  Generation: ${elapsed.toFixed(2)}ms`);
        expect(elapsed).toBeLessThan(100);
    });

    it('net computation should complete under 30ms', () => {
        const result = generateFromPrompt(PROMPT);
        const start = performance.now();
        computeNets(result.symbols, result.wires);
        const elapsed = performance.now() - start;
        console.log(`  Net compute: ${elapsed.toFixed(2)}ms`);
        expect(elapsed).toBeLessThan(30);
    });

    it('ERC should complete under 50ms', () => {
        const result = generateFromPrompt(PROMPT);
        const start = performance.now();
        runErc(result.symbols, result.wires);
        const elapsed = performance.now() - start;
        console.log(`  ERC: ${elapsed.toFixed(2)}ms`);
        expect(elapsed).toBeLessThan(50);
    });
});

/* ═══════════════════════════════════════════════════════════════════════
   9. PROFESSIONAL EE WIRING RULES
   ═══════════════════════════════════════════════════════════════════════ */

describe('9 — Professional EE Wiring Rules', () => {

    // ── 9.1  Power supply chain ────────────────────────────────────────

    describe('9.1 — Power Supply Chain', () => {

        it('3V3 rail must have at least one power_out source (LDO output)', () => {
            const net3v3 = nets.find(n => n.name === '3V3' || n.id === '3V3');
            expect(net3v3).toBeDefined();

            const hasPowerOut = net3v3!.pinRefs.some(pr => {
                const sym = symbols.find(s => s.id === pr.symbolId);
                if (!sym) return false;
                const def = symbolMap.get(sym.symbolRef);
                if (!def) return false;
                const pin = def.pins.find(p => p.id === pr.pinId);
                return pin?.electricalType === 'power_out';
            });
            expect(hasPowerOut, '3V3 net has no power_out driver').toBe(true);
        });

        it('GND net must connect all IC ground pins (no floating grounds)', () => {
            const netGnd = nets.find(n => n.name === 'GND' || n.id === 'GND');
            expect(netGnd).toBeDefined();

            const ics = symbols.filter(s => {
                const def = symbolMap.get(s.symbolRef);
                return def && ['MCU', 'Sensor', 'Power'].includes(def.category);
            });

            for (const ic of ics) {
                const def = symbolMap.get(ic.symbolRef)!;
                const gndPin = def.pins.find(p => p.name === 'GND' || p.id === 'gnd');
                if (!gndPin) continue;

                const onGndNet = netGnd!.pinRefs.some(
                    pr => pr.symbolId === ic.id && pr.pinId === gndPin.id
                );
                expect(
                    onGndNet,
                    `${ic.properties.reference} GND pin is not on the GND net — floating ground!`
                ).toBe(true);
            }
        });

        it('every power_in pin on every IC should reach a net with a power_out source', () => {
            for (const sym of symbols) {
                const def = symbolMap.get(sym.symbolRef);
                if (!def) continue;

                for (const pin of def.pins) {
                    if (pin.electricalType !== 'power_in') continue;

                    const pinNet = nets.find(n =>
                        n.pinRefs.some(pr => pr.symbolId === sym.id && pr.pinId === pin.id)
                    );

                    if (!pinNet) continue; // Unconnected — ERC catches this separately

                    const hasPowerSource = pinNet.pinRefs.some(pr => {
                        const s = symbols.find(ss => ss.id === pr.symbolId);
                        if (!s) return false;
                        const d = symbolMap.get(s.symbolRef);
                        if (!d) return false;
                        const p = d.pins.find(pp => pp.id === pr.pinId);
                        return p?.electricalType === 'power_out';
                    });

                    // Also accept if the IC itself is a power symbol
                    const isPowerCat = def.category === 'Power';

                    expect(
                        hasPowerSource || isPowerCat,
                        `${sym.properties.reference}.${pin.name} (power_in) is on net "${pinNet.name}" which has no power source`
                    ).toBe(true);
                }
            }
        });

        it('regulator input (REG1.IN) should NOT be on the same net as its output (REG1.OUT)', () => {
            const reg = symbols.find(s => s.properties.reference === 'REG1')!;

            const inNet = nets.find(n =>
                n.pinRefs.some(pr => pr.symbolId === reg.id && pr.pinId === 'in')
            );
            const outNet = nets.find(n =>
                n.pinRefs.some(pr => pr.symbolId === reg.id && pr.pinId === 'out')
            );

            if (inNet && outNet) {
                expect(
                    inNet.id !== outNet.id,
                    'LDO input and output are shorted — regulator bypass!'
                ).toBe(true);
            }
        });
    });

    // ── 9.2  Decoupling capacitor rules ────────────────────────────────

    describe('9.2 — Decoupling Capacitors', () => {

        it('every IC with requiresDecoupling metadata should have a decap', () => {
            const icsNeedingDecap = symbols.filter(s => {
                const def = symbolMap.get(s.symbolRef);
                return def?.metadata?.requiresDecoupling === true;
            });

            for (const ic of icsNeedingDecap) {
                const def = symbolMap.get(ic.symbolRef)!;
                const powerPin = def.pins.find(p =>
                    p.electricalType === 'power_in' && p.name !== 'GND'
                ) || def.pins.find(p => p.electricalType === 'power_out');

                if (!powerPin) continue;

                // Find the net this pin is on
                const powerNet = nets.find(n =>
                    n.pinRefs.some(pr => pr.symbolId === ic.id && pr.pinId === powerPin.id)
                );

                if (!powerNet) continue;

                // Check if a capacitor p1 is on the same net
                const hasDecapOnPower = powerNet.pinRefs.some(pr => {
                    const s = symbols.find(ss => ss.id === pr.symbolId);
                    return s && s.symbolRef === 'sym_capacitor' && pr.pinId === 'p1';
                });

                expect(
                    hasDecapOnPower,
                    `${ic.properties.reference} (${def.name}) requires decoupling but has no capacitor on its power net "${powerNet.name}"`
                ).toBe(true);
            }
        });

        it('decoupling cap p1 should be on power rail and p2 on GND (correct polarity)', () => {
            const caps = symbols.filter(s => s.symbolRef === 'sym_capacitor');
            const netGnd = nets.find(n => n.name === 'GND' || n.id === 'GND');

            for (const cap of caps) {
                // p1 should be on a power net (not GND)
                const p1Net = nets.find(n =>
                    n.pinRefs.some(pr => pr.symbolId === cap.id && pr.pinId === 'p1')
                );
                // p2 should be on GND
                const p2Net = nets.find(n =>
                    n.pinRefs.some(pr => pr.symbolId === cap.id && pr.pinId === 'p2')
                );

                expect(
                    p1Net,
                    `${cap.properties.reference}.p1 is not connected to any net`
                ).toBeDefined();

                if (p1Net) {
                    expect(
                        p1Net.name !== 'GND' && p1Net.id !== 'GND',
                        `${cap.properties.reference}.p1 is on GND — reversed polarity`
                    ).toBe(true);
                }

                expect(
                    p2Net && (p2Net.name === 'GND' || p2Net.id === 'GND'),
                    `${cap.properties.reference}.p2 should be on GND but is on "${p2Net?.name || 'unconnected'}"`
                ).toBe(true);
            }
        });

        it('decoupling caps should be physically close to their IC (< 300px)', () => {
            const MAX_DISTANCE = 300; // pixels ≈ proximity on schematic

            // C_DEC1 → U1, C_DEC2 → U2, C_IN → REG1
            const pairs = [
                { capRef: 'C_DEC1', icRef: 'U1' },
                { capRef: 'C_DEC2', icRef: 'U2' },
                { capRef: 'C_IN', icRef: 'REG1' },
            ];

            for (const { capRef, icRef } of pairs) {
                const cap = symbols.find(s => s.properties.reference === capRef);
                const ic = symbols.find(s => s.properties.reference === icRef);
                if (!cap || !ic) continue;

                const dx = cap.x - ic.x;
                const dy = cap.y - ic.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                expect(
                    dist,
                    `${capRef} is ${dist.toFixed(0)}px from ${icRef} — too far for effective decoupling`
                ).toBeLessThan(MAX_DISTANCE);
            }
        });
    });

    // ── 9.3  I2C bus integrity ─────────────────────────────────────────

    describe('9.3 — I2C Bus Integrity', () => {

        it('SDA line should have exactly one pull-up resistor', () => {
            // Template wires: R_PU1.p2 → SDA
            const sdaWires = wires.filter(w => w.netId === 'SDA');
            const pullupOnSda = sdaWires.some(w => {
                const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1');
                if (!rPu1) return false;
                const def = symbolMap.get(rPu1.symbolRef)!;
                const p2Pos = getPinAbsolutePosition(rPu1, def.pins.find(p => p.id === 'p2')!);
                const first = w.points[0];
                const last = w.points[w.points.length - 1];
                return (Math.abs(first.x - p2Pos.x) < 5 && Math.abs(first.y - p2Pos.y) < 5) ||
                       (Math.abs(last.x - p2Pos.x) < 5 && Math.abs(last.y - p2Pos.y) < 5);
            });
            expect(pullupOnSda, 'SDA has no pull-up resistor connected').toBe(true);
        });

        it('SCL line should have exactly one pull-up resistor', () => {
            const sclWires = wires.filter(w => w.netId === 'SCL');
            const pullupOnScl = sclWires.some(w => {
                const rPu2 = symbols.find(s => s.properties.reference === 'R_PU2');
                if (!rPu2) return false;
                const def = symbolMap.get(rPu2.symbolRef)!;
                const p2Pos = getPinAbsolutePosition(rPu2, def.pins.find(p => p.id === 'p2')!);
                const first = w.points[0];
                const last = w.points[w.points.length - 1];
                return (Math.abs(first.x - p2Pos.x) < 5 && Math.abs(first.y - p2Pos.y) < 5) ||
                       (Math.abs(last.x - p2Pos.x) < 5 && Math.abs(last.y - p2Pos.y) < 5);
            });
            expect(pullupOnScl, 'SCL has no pull-up resistor connected').toBe(true);
        });

        it('pull-up resistors should pull to VCC (3V3), not to GND', () => {
            const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1')!;
            const rPu2 = symbols.find(s => s.properties.reference === 'R_PU2')!;

            // p1 of each pull-up should be on 3V3 (power side)
            for (const pu of [rPu1, rPu2]) {
                const p1Net = nets.find(n =>
                    n.pinRefs.some(pr => pr.symbolId === pu.id && pr.pinId === 'p1')
                );
                expect(
                    p1Net && (p1Net.name === '3V3' || p1Net.id === '3V3'),
                    `${pu.properties.reference}.p1 should pull to 3V3 but is on "${p1Net?.name || 'none'}"`
                ).toBe(true);
            }

            // p2 of each should be on signal line (SDA or SCL), NOT on GND or power
            for (const pu of [rPu1, rPu2]) {
                const p2Net = nets.find(n =>
                    n.pinRefs.some(pr => pr.symbolId === pu.id && pr.pinId === 'p2')
                );
                expect(
                    p2Net && p2Net.name !== 'GND' && p2Net.name !== '3V3',
                    `${pu.properties.reference}.p2 should be on signal line but is on "${p2Net?.name || 'none'}"`
                ).toBe(true);
            }
        });

        it('SDA and SCL pull-ups should be on the same voltage rail', () => {
            const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1')!;
            const rPu2 = symbols.find(s => s.properties.reference === 'R_PU2')!;

            const pu1PowerNet = nets.find(n =>
                n.pinRefs.some(pr => pr.symbolId === rPu1.id && pr.pinId === 'p1')
            );
            const pu2PowerNet = nets.find(n =>
                n.pinRefs.some(pr => pr.symbolId === rPu2.id && pr.pinId === 'p1')
            );

            expect(pu1PowerNet).toBeDefined();
            expect(pu2PowerNet).toBeDefined();
            expect(
                pu1PowerNet!.id === pu2PowerNet!.id,
                `SDA pull-up is on "${pu1PowerNet!.name}" but SCL pull-up is on "${pu2PowerNet!.name}" — voltage mismatch!`
            ).toBe(true);
        });

        it('I2C signals should not have output-type drivers (only bidirectional/open-drain)', () => {
            for (const netName of ['SDA', 'SCL']) {
                const net = nets.find(n => n.name === netName || n.id === netName);
                if (!net) continue;

                const outputPins = net.pinRefs.filter(pr => {
                    const sym = symbols.find(s => s.id === pr.symbolId);
                    if (!sym) return false;
                    const def = symbolMap.get(sym.symbolRef);
                    if (!def) return false;
                    const pin = def.pins.find(p => p.id === pr.pinId);
                    return pin?.electricalType === 'output'; // push-pull output on I2C is wrong
                });

                expect(
                    outputPins.length,
                    `${netName} has push-pull output driver(s) — I2C requires open-drain/bidirectional`
                ).toBe(0);
            }
        });
    });

    // ── 9.4  Voltage domain consistency ────────────────────────────────

    describe('9.4 — Voltage Domain Consistency', () => {

        it('all components on 3V3 net should be rated for 3.3V domain', () => {
            const net3v3 = nets.find(n => n.name === '3V3' || n.id === '3V3');
            if (!net3v3) return;

            for (const pr of net3v3.pinRefs) {
                const sym = symbols.find(s => s.id === pr.symbolId);
                if (!sym) continue;
                const def = symbolMap.get(sym.symbolRef);
                if (!def || !def.metadata?.voltageDomain) continue;

                // Passives (resistors/caps) have no domain constraint
                if (def.metadata.category === 'passive') continue;

                const domain = def.metadata.voltageDomain;
                expect(
                    domain === '3.3V' || domain === 'ADJUSTABLE',
                    `${sym.properties.reference} has domain ${domain} but is on 3V3 rail — voltage mismatch!`
                ).toBe(true);
            }
        });

        it('no 5V-domain component should be directly connected to a 3.3V-domain I/O pin', () => {
            // Check all signal nets (not power/GND)
            const signalNets = nets.filter(n =>
                n.name !== '3V3' && n.name !== 'GND' && n.name !== '5V' && n.name !== '12V' &&
                n.id !== '3V3' && n.id !== 'GND' && n.id !== '5V' && n.id !== '12V'
            );

            for (const net of signalNets) {
                const domains = new Set<string>();
                for (const pr of net.pinRefs) {
                    const sym = symbols.find(s => s.id === pr.symbolId);
                    if (!sym) continue;
                    const def = symbolMap.get(sym.symbolRef);
                    if (!def?.metadata?.voltageDomain) continue;
                    if (def.metadata.category === 'passive') continue;
                    domains.add(def.metadata.voltageDomain);
                }

                // Remove ADJUSTABLE — it's fine on any domain
                domains.delete('ADJUSTABLE');

                expect(
                    domains.size <= 1,
                    `Net "${net.name}" mixes voltage domains: ${[...domains].join(', ')} — needs level shifter!`
                ).toBe(true);
            }
        });
    });

    // ── 9.5  Ground topology ───────────────────────────────────────────

    describe('9.5 — Ground Topology', () => {

        it('GND net should be a single connected net (no split grounds)', () => {
            // All GND-labelled wires should resolve to the same net
            const gndNets = nets.filter(n => n.name === 'GND' || n.id === 'GND');
            expect(
                gndNets.length,
                `Found ${gndNets.length} separate GND nets — ground plane is split!`
            ).toBe(1);
        });

        it('every decoupling cap GND pin should be on the main GND net', () => {
            const caps = symbols.filter(s => s.symbolRef === 'sym_capacitor');
            const gndNet = nets.find(n => n.name === 'GND' || n.id === 'GND');
            expect(gndNet).toBeDefined();

            for (const cap of caps) {
                const p2OnGnd = gndNet!.pinRefs.some(
                    pr => pr.symbolId === cap.id && pr.pinId === 'p2'
                );
                expect(
                    p2OnGnd,
                    `${cap.properties.reference}.p2 is not on main GND — broken ground return path!`
                ).toBe(true);
            }
        });
    });

    // ── 9.6  Signal path completeness ──────────────────────────────────

    describe('9.6 — Signal Path Completeness', () => {

        it('I2C SDA must form a complete path: MCU → Sensor (with pull-up tee)', () => {
            // Verify wires exist for both legs of SDA
            const sdaWires = wires.filter(w => w.netId === 'SDA');
            expect(sdaWires.length, 'SDA should have 2 wires: MCU→Sensor and Pullup→Sensor').toBe(2);

            // Verify the wires touch the correct pins
            const u1 = symbols.find(s => s.properties.reference === 'U1')!;
            const u2 = symbols.find(s => s.properties.reference === 'U2')!;
            const rPu1 = symbols.find(s => s.properties.reference === 'R_PU1')!;

            const u1Def = symbolMap.get(u1.symbolRef)!;
            const u2Def = symbolMap.get(u2.symbolRef)!;

            const u1Sda = getPinAbsolutePosition(u1, u1Def.pins.find(p => p.id === 'gpio21')!);
            const u2Sda = getPinAbsolutePosition(u2, u2Def.pins.find(p => p.id === 'sda')!);

            // At least one SDA wire should start/end at U1.GPIO21
            const touchesU1 = sdaWires.some(w => {
                const f = w.points[0], l = w.points[w.points.length - 1];
                return (Math.abs(f.x - u1Sda.x) < 5 && Math.abs(f.y - u1Sda.y) < 5) ||
                       (Math.abs(l.x - u1Sda.x) < 5 && Math.abs(l.y - u1Sda.y) < 5);
            });
            expect(touchesU1, 'No SDA wire reaches U1.GPIO21 (MCU SDA)').toBe(true);

            // At least one SDA wire should start/end at U2.SDA
            const touchesU2 = sdaWires.some(w => {
                const f = w.points[0], l = w.points[w.points.length - 1];
                return (Math.abs(f.x - u2Sda.x) < 5 && Math.abs(f.y - u2Sda.y) < 5) ||
                       (Math.abs(l.x - u2Sda.x) < 5 && Math.abs(l.y - u2Sda.y) < 5);
            });
            expect(touchesU2, 'No SDA wire reaches U2.SDA (BME280 SDA)').toBe(true);
        });

        it('I2C SCL must form a complete path: MCU → Sensor (with pull-up tee)', () => {
            const sclWires = wires.filter(w => w.netId === 'SCL');
            expect(sclWires.length, 'SCL should have 2 wires: MCU→Sensor and Pullup→Sensor').toBe(2);

            const u1 = symbols.find(s => s.properties.reference === 'U1')!;
            const u2 = symbols.find(s => s.properties.reference === 'U2')!;

            const u1Def = symbolMap.get(u1.symbolRef)!;
            const u2Def = symbolMap.get(u2.symbolRef)!;

            const u1Scl = getPinAbsolutePosition(u1, u1Def.pins.find(p => p.id === 'gpio22')!);
            const u2Scl = getPinAbsolutePosition(u2, u2Def.pins.find(p => p.id === 'scl')!);

            const touchesU1 = sclWires.some(w => {
                const f = w.points[0], l = w.points[w.points.length - 1];
                return (Math.abs(f.x - u1Scl.x) < 5 && Math.abs(f.y - u1Scl.y) < 5) ||
                       (Math.abs(l.x - u1Scl.x) < 5 && Math.abs(l.y - u1Scl.y) < 5);
            });
            expect(touchesU1, 'No SCL wire reaches U1.GPIO22 (MCU SCL)').toBe(true);

            const touchesU2 = sclWires.some(w => {
                const f = w.points[0], l = w.points[w.points.length - 1];
                return (Math.abs(f.x - u2Scl.x) < 5 && Math.abs(f.y - u2Scl.y) < 5) ||
                       (Math.abs(l.x - u2Scl.x) < 5 && Math.abs(l.y - u2Scl.y) < 5);
            });
            expect(touchesU2, 'No SCL wire reaches U2.SCL (BME280 SCL)').toBe(true);
        });

        it('power chain should be continuous: REG1.OUT → U1.3V3 → U2.VCC', () => {
            const reg1 = symbols.find(s => s.properties.reference === 'REG1')!;
            const u1 = symbols.find(s => s.properties.reference === 'U1')!;
            const u2 = symbols.find(s => s.properties.reference === 'U2')!;

            // All three should be on the same 3V3 net
            const net3v3 = nets.find(n => n.name === '3V3' || n.id === '3V3');
            expect(net3v3).toBeDefined();

            const pinKeys = net3v3!.pinRefs.map(pr => `${pr.symbolId}::${pr.pinId}`);
            expect(pinKeys, 'REG1.out missing from 3V3').toContain(`${reg1.id}::out`);
            expect(pinKeys, 'U1.3v3 missing from 3V3').toContain(`${u1.id}::3v3`);
            expect(pinKeys, 'U2.vcc missing from 3V3').toContain(`${u2.id}::vcc`);
        });
    });

    // ── 9.7  Wire orthogonality (professional schematic standard) ──────

    describe('9.7 — Wire Orthogonality', () => {

        it('all wire segments should be perfectly horizontal or vertical (90° angles only)', () => {
            for (const wire of wires) {
                for (let i = 0; i < wire.points.length - 1; i++) {
                    const p1 = wire.points[i];
                    const p2 = wire.points[i + 1];

                    const isHorizontal = p1.y === p2.y;
                    const isVertical = p1.x === p2.x;

                    expect(
                        isHorizontal || isVertical,
                        `Wire ${wire.netId} segment ${i}: (${p1.x},${p1.y})→(${p2.x},${p2.y}) is diagonal — violates orthogonal routing`
                    ).toBe(true);
                }
            }
        });
    });

    // ── 9.8  No duplicate wires (same two pins connected twice) ────────

    describe('9.8 — No Duplicate Connections', () => {

        it('no two wires should connect the same pair of pin positions', () => {
            const wireEndpoints = wires.map(w => {
                const f = w.points[0];
                const l = w.points[w.points.length - 1];
                // Sort so (A→B) and (B→A) are the same
                const key1 = `${f.x},${f.y}`;
                const key2 = `${l.x},${l.y}`;
                return key1 < key2 ? `${key1}→${key2}` : `${key2}→${key1}`;
            });

            const seen = new Set<string>();
            for (const ep of wireEndpoints) {
                expect(
                    seen.has(ep),
                    `Duplicate wire detected between ${ep}`
                ).toBe(false);
                seen.add(ep);
            }
        });
    });
});
