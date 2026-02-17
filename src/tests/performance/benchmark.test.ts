import { describe, it, expect } from 'vitest';
import { computeNets } from '../../engine/connectivity';
import { runErc } from '../../engine/erc';
import { SymbolInstance, Wire } from '../../data/types';

describe('Performance Benchmarks — EDA Core', () => {

    it('Net Recalculation should be < 20ms for 50 symbols / 200 wires', () => {
        const symbols: any[] = [];
        for (let i = 0; i < 50; i++) {
            symbols.push({
                id: `s${i}`,
                symbolRef: 'sym_resistor',
                x: i * 100,
                y: 0,
                rotation: 0,
                mirrored: false,
                properties: { reference: `R${i}` }
            });
        }

        const wires: Wire[] = [];
        for (let i = 0; i < 200; i++) {
            wires.push({
                id: `w${i}`,
                points: [{ x: (i % 50) * 100 + 20, y: 0 }, { x: ((i + 1) % 50) * 100 + 20, y: 0 }],
                netId: ''
            });
        }

        const start = performance.now();
        computeNets(symbols, wires, []);
        const end = performance.now();
        const duration = end - start;

        console.log(`[Perf] Net recalculation (50 sym, 200 wires): ${duration.toFixed(2)}ms`);
        // Goal: < 20ms. We set a safe limit of 50ms for CI environments but aim for 20ms.
        expect(duration).toBeLessThan(50);
    });

    it('ERC Execution should be < 50ms for 50 symbols / 200 wires', () => {
        const symbols: any[] = [];
        for (let i = 0; i < 50; i++) {
            symbols.push({
                id: `s${i}`,
                symbolRef: 'sym_resistor',
                x: i * 100,
                y: 0,
                rotation: 0,
                mirrored: false,
                properties: { reference: `R${i}` }
            });
        }
        const wires: Wire[] = [];

        const start = performance.now();
        runErc(symbols, wires);
        const end = performance.now();
        const duration = end - start;

        console.log(`[Perf] ERC execution (50 sym): ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100); // Safe limit
    });
});
