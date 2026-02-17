/* Debug script — run with: npx vitest run src/tests/iot/debug_wiring.test.ts */

import { describe, it } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { computeNets, getPinAbsolutePosition } from '../../engine/connectivity';
import { symbolMap } from '../../data/symbolLibrary';

describe('DEBUG — Sensor Node Wiring Trace', () => {
    it('dump wire coordinates and net assignments', () => {
        const PROMPT = 'Create ESP32 with BME280 I2C sensor, 4.7k pullups and 3.3V power';
        const { symbols, wires } = generateFromPrompt(PROMPT);
        const nets = computeNets(symbols, wires);

        console.log('\n=== SYMBOLS ===');
        for (const s of symbols) {
            const def = symbolMap.get(s.symbolRef)!;
            console.log(`  ${s.properties.reference} (${s.symbolRef}) at (${s.x}, ${s.y}) size ${def.width}x${def.height}`);
            for (const pin of def.pins) {
                const pos = getPinAbsolutePosition(s, pin);
                console.log(`    ${pin.id} (${pin.name}): abs (${pos.x}, ${pos.y}) [${pin.orientation}, ${pin.electricalType}]`);
            }
        }

        console.log('\n=== WIRES ===');
        for (const w of wires) {
            const pts = w.points.map(p => `(${p.x},${p.y})`).join(' → ');
            console.log(`  [${w.netId}] ${pts}`);
        }

        console.log('\n=== NETS ===');
        for (const n of nets) {
            const pins = n.pinRefs.map(pr => {
                const sym = symbols.find(s => s.id === pr.symbolId);
                return sym ? `${sym.properties.reference}.${pr.pinId}` : `??.${pr.pinId}`;
            }).join(', ');
            console.log(`  ${n.name} (id=${n.id}): pins=[${pins}] wires=[${n.wireIds.length}]`);
        }

        // Check for shared coordinates between different-net wires
        console.log('\n=== SHARED WAYPOINTS (cross-net) ===');
        const pointMap = new Map<string, string[]>();
        for (const w of wires) {
            for (const p of w.points) {
                const key = `${Math.round(p.x)},${Math.round(p.y)}`;
                if (!pointMap.has(key)) pointMap.set(key, []);
                pointMap.get(key)!.push(w.netId || '??');
            }
        }
        for (const [key, netIds] of pointMap) {
            const unique = [...new Set(netIds)];
            if (unique.length > 1) {
                console.log(`  ⚠️  (${key}) shared by nets: ${unique.join(', ')}`);
            }
        }
    });
});
