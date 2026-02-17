import { describe, it, expect } from 'vitest';
import { computeNets } from '../../engine/connectivity';
import { Wire, Junction } from '../../data/types';

describe('Connectivity Engine — Hard Validation', () => {

    it('[C01] Straight segment should form one net', () => {
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }], netId: '' }
        ];
        const nets = computeNets([], wires, []);
        expect(nets.length).toBe(1);
        expect(nets[0].wireIds).toContain('w1');
    });

    it('[C02] L-junction should connect two wires', () => {
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }], netId: '' },
            { id: 'w2', points: [{ x: 100, y: 0 }, { x: 100, y: 100 }], netId: '' }
        ];
        const nets = computeNets([], wires, []);
        expect(nets.length).toBe(1);
        expect(nets[0].wireIds).toContain('w1');
        expect(nets[0].wireIds).toContain('w2');
    });

    it('[C04] T-junction WITHOUT junction dot must NOT connect', () => {
        const wires: Wire[] = [
            { id: 'w_main', points: [{ x: 0, y: 50 }, { x: 200, y: 50 }], netId: '' },
            { id: 'w_branch', points: [{ x: 100, y: 50 }, { x: 100, y: 100 }], netId: '' }
        ];
        const nets = computeNets([], wires, []);
        // They meet at (100, 50), but w_main is a single segment [0, 50]->[200, 50]
        // Since no junction exists at (100, 50), and w_branch endpoint is on a segment (not endpoint)
        // of w_main, they should NOT connect in a professional CAD engine.
        expect(nets.length).toBe(2);
    });

    it('[C03] T-junction WITH junction dot must connect', () => {
        const wires: Wire[] = [
            { id: 'w_main', points: [{ x: 0, y: 50 }, { x: 200, y: 50 }], netId: '' },
            { id: 'w_branch', points: [{ x: 100, y: 50 }, { x: 100, y: 100 }], netId: '' }
        ];
        const junctions: Junction[] = [{ id: 'j1', x: 100, y: 50 }];
        const nets = computeNets([], wires, junctions);
        expect(nets.length).toBe(1);
    });

    it('[C06] X-crossing WITHOUT junction dot must NOT connect', () => {
        const wires: Wire[] = [
            { id: 'w_h', points: [{ x: 0, y: 100 }, { x: 200, y: 100 }], netId: '' },
            { id: 'w_v', points: [{ x: 100, y: 0 }, { x: 100, y: 200 }], netId: '' }
        ];
        const nets = computeNets([], wires, []);
        expect(nets.length).toBe(2);
    });

    it('[C05] X-crossing WITH junction dot must connect', () => {
        const wires: Wire[] = [
            { id: 'w_h', points: [{ x: 0, y: 100 }, { x: 200, y: 100 }], netId: '' },
            { id: 'w_v', points: [{ x: 100, y: 0 }, { x: 100, y: 200 }], netId: '' }
        ];
        const junctions: Junction[] = [{ id: 'j1', x: 100, y: 100 }];
        const nets = computeNets([], wires, junctions);
        expect(nets.length).toBe(1);
    });

    it('[C07] Overlapping collinear wires should merge', () => {
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }], netId: '' },
            { id: 'w2', points: [{ x: 50, y: 0 }, { x: 150, y: 0 }], netId: '' }
        ];
        const junctions: Junction[] = [{ id: 'j1', x: 75, y: 0 }]; // Junction on overlap
        const nets = computeNets([], wires, junctions);
        expect(nets.length).toBe(1);
    });

    it('[C08] Wire ending exactly on another wire endpoint should connect', () => {
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], netId: '' },
            { id: 'w2', points: [{ x: 100, y: 100 }, { x: 200, y: 200 }], netId: '' }
        ];
        const nets = computeNets([], wires, []);
        expect(nets.length).toBe(1);
    });

    it('[C09] Pin on wire endpoint should connect', () => {
        const symbols: any[] = [{
            id: 'sym1',
            symbolRef: 'sym_resistor',
            x: 0, y: 0, rotation: 0, mirrored: false,
            properties: { reference: 'R1', value: '10k' }
        }];
        // Note: sym_resistor pin p1 is at (G, 0). G=20.
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 20, y: 0 }, { x: 100, y: 0 }], netId: '' }
        ];
        const nets = computeNets(symbols, wires, []);
        // Expected: Net_0 (pin1 + wire1), Net_1 (pin2 floating)
        expect(nets.length).toBe(2);
        const connectedNet = nets.find(n => n.wireIds.includes('w1'));
        expect(connectedNet?.pinRefs.length).toBe(1);
        expect(connectedNet?.pinRefs[0].symbolId).toBe('sym1');
    });

    it('[C10] Pin on midpoint MUST NOT connect without junction', () => {
        const symbols: any[] = [{
            id: 'sym1',
            symbolRef: 'sym_resistor',
            x: 80, y: 0, rotation: 0, mirrored: false,
            properties: { reference: 'R1', value: '10k' }
        }];
        // Pin p1 is at (80+20, 0) = (100, 0)
        // Wire is [0, 0] -> [200, 0]
        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 0, y: 0 }, { x: 200, y: 0 }], netId: '' }
        ];
        const nets = computeNets(symbols, wires, []);
        // Expected: Net_0 (wire1), Net_1 (pin1 floating), Net_2 (pin2 floating)
        expect(nets.length).toBe(3);
        const wireNet = nets.find(n => n.wireIds.includes('w1'));
        expect(wireNet?.pinRefs.length).toBe(0); // Should be empty
    });

    it('[C13] Symbol rotation (90deg) should update pin positions and reconnect', () => {
        // R1: p1 is (20, 0), p2 is (20, 80) relative to (x, y)
        // Center of sym_resistor is (20, 40)
        const symbols: any[] = [{
            id: 'sym1',
            symbolRef: 'sym_resistor',
            x: 100, y: 100, rotation: 90, mirrored: false,
            properties: { reference: 'R1', value: '10k' }
        }];

        // After 90deg rotation around center (20, 40):
        // p1(20, 0) relative to center: (0, -40)
        // Rotated 90deg (x, y) -> (-y, x) => (40, 0)
        // Absolute: (100+20+40, 100+40+0) = (160, 140)

        const wires: Wire[] = [
            { id: 'w1', points: [{ x: 160, y: 140 }, { x: 200, y: 140 }], netId: '' }
        ];
        const nets = computeNets(symbols, wires, []);
        // Expected: Net_0 (pin1 + wire1), Net_1 (pin2)
        expect(nets.length).toBe(2);
        const connectedNet = nets.find(n => n.wireIds.includes('w1'));
        expect(connectedNet?.pinRefs.length).toBe(1);
    });
});
