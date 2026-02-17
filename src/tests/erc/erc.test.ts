import { describe, it, expect } from 'vitest';
import { runErc } from '../../engine/erc';
import { SymbolInstance, Wire, Junction } from '../../data/types';

describe('ERC Engine — Hard Validation', () => {

    it('Rule 1: Should flag unconnected pins', () => {
        const symbols: any[] = [{
            id: 'sym1',
            symbolRef: 'sym_resistor',
            x: 0, y: 0, rotation: 0, mirrored: false,
            properties: { reference: 'R1', value: '10k' }
        }];
        const violations = runErc(symbols, []);
        // R1 has 2 pins, both are unconnected.
        expect(violations.length).toBe(2);
        expect(violations[0].message).toContain('Unconnected pin');
    });

    it('Rule 3: Should flag output-to-output conflict', () => {
        // Use a symbol with an output pin
        // Note: sym_opamp typically has outputs.
        // Let's use two symbols and wire their 'output' pins together.
        const symbols: any[] = [
            { id: 's1', symbolRef: 'sym_opamp', x: 0, y: 0, rotation: 0, mirrored: false, properties: { reference: 'U1' } },
            { id: 's2', symbolRef: 'sym_opamp', x: 200, y: 0, rotation: 0, mirrored: false, properties: { reference: 'U2' } }
        ];
        // sym_opamp pin p3 is output. (Calculated based on G=20)
        // def.pins: [{id:'p1', name:'-', x:0, y:G}, {id:'p2', name:'+', x:0, y:G*3}, {id:'p3', name:'OUT', x:G*4, y:G*2}]
        // OUT is at (100, 40) relative to x,y.
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 100, y: 40 }, { x: 300, y: 40 }], netId: '' }
        ];
        const violations = runErc(symbols, wires);
        const conflict = violations.find(v => v.message.toLowerCase().includes('conflict'));
        expect(conflict).toBeDefined();
        expect(conflict?.severity).toBe('error');
    });

    it('Rule 5: Should flag duplicate reference designators', () => {
        const symbols: any[] = [
            { id: 's1', symbolRef: 'sym_resistor', x: 0, y: 0, rotation: 0, mirrored: false, properties: { reference: 'R1' } },
            { id: 's2', symbolRef: 'sym_capacitor', x: 100, y: 0, rotation: 0, mirrored: false, properties: { reference: 'R1' } }
        ];
        const violations = runErc(symbols, []);
        const duplicate = violations.find(v => v.message.toLowerCase().includes('duplicate'));
        expect(duplicate).toBeDefined();
    });

    it('Rule 8: Should flag unused nets (wires without pins)', () => {
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], netId: '' }
        ];
        const violations = runErc([], wires);
        const unused = violations.find(v => v.message.toLowerCase().includes('unused net'));
        expect(unused).toBeDefined();
        expect(unused?.severity).toBe('warning');
    });
});
