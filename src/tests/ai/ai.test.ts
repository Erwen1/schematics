import { describe, it, expect } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { runErc } from '../../engine/erc';
import { autoPlaceFootprints } from '../../engine/aiPcbEngine';
import { FootprintInstance } from '../../data/types';
import { RatsnestLine } from '../../engine/ratsnest';

describe('AI Engine Determinism & Quality', () => {

    it('Should generate identical count of elements for same prompt', () => {
        const prompt = 'Add 5V power and ESP32 mcu';
        const res1 = generateFromPrompt(prompt);
        const res2 = generateFromPrompt(prompt);

        expect(res1.symbols.length).toBe(res2.symbols.length);
        expect(res1.wires.length).toBe(res2.wires.length);
        expect(res1.symbols.length).toBeGreaterThan(0);
    });

    it('AI generated "power" template should be ERC-clean', () => {
        const prompt = 'Add power';
        const { symbols, wires } = generateFromPrompt(prompt);

        // Pass to ERC
        const violations = runErc(symbols, wires);

        // ERC Rule 1 (Unconnected pins) will always find something in a partial circuit
        // but it should NOT have Rule 3 (Conflicts) or Rule 5 (Duplicates)
        const criticalErrors = violations.filter(v => v.severity === 'error');
        expect(criticalErrors.length).toBe(0);
    });

    it('Smart PCB Auto-placement should reduce ratsnest length', () => {
        // Setup 2 feet far apart with a connection
        const footprints: FootprintInstance[] = [
            { id: 'F1', footprintRef: 'f_res', componentRef: 'R1', x: 0, y: 0, rotation: 0, flipped: false },
            { id: 'F2', footprintRef: 'f_res', componentRef: 'R2', x: 500, y: 500, rotation: 0, flipped: false }
        ];
        const ratsnest: RatsnestLine[] = [
            { netId: 'n1', from: { componentId: 'F1', padId: 'p1', x: 0, y: 0 }, to: { componentId: 'F2', padId: 'p1', x: 500, y: 500 } }
        ];

        function calcTotalLength(fps: FootprintInstance[]) {
            // Simplified: distance between F1 and F2
            const f1 = fps.find(f => f.id === 'F1')!;
            const f2 = fps.find(f => f.id === 'F2')!;
            return Math.sqrt(Math.pow(f1.x - f2.x, 2) + Math.pow(f1.y - f2.y, 2));
        }

        const initialDist = calcTotalLength(footprints);
        const optimized = autoPlaceFootprints(footprints, ratsnest);
        const finalDist = calcTotalLength(optimized);

        // Force-directed should pull them together
        expect(finalDist).toBeLessThan(initialDist);
    });
});
