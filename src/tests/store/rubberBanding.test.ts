import { describe, it, expect, beforeEach } from 'vitest';
import { useSchematicStore } from '../../store/schematicStore';

describe('Connectivity Persistence (Rubber Banding)', () => {
    beforeEach(() => {
        useSchematicStore.getState().newProject();
    });

    it('should move wire endpoints when a symbol is moved', () => {
        const store = useSchematicStore.getState();

        // sym_resistor width=40, height=80. 
        // pin p1 at (20, 0), orientation 'up', length 20.
        // Tip of p1 is (20, -20) rel to origin.
        // Absolute p1 tip: (100+20, 100-20) = (120, 80)
        store.addSymbol('sym_resistor', 100, 100);
        const sym = useSchematicStore.getState().symbols[0];

        // 2. Add a wire connected to p1 tip
        store.addWire([{ x: 120, y: 80 }, { x: 200, y: 80 }]);

        // 3. Move symbol to (200, 200)
        // New absolute p1 tip: (220, 180)
        store.moveSymbol(sym.id, 200, 200);

        const updatedWire = useSchematicStore.getState().wires[0];
        expect(updatedWire.points[0]).toEqual({ x: 220, y: 180 });
        expect(updatedWire.points[1]).toEqual({ x: 200, y: 80 });
    });

    it('should rotate wire endpoints when a symbol is rotated', () => {
        const store = useSchematicStore.getState();
        // sym_resistor at (100, 100). Size (40, 80). Center (120, 140).
        // p1 tip rel to center: (120-120, 80-140) = (0, -60).
        store.addSymbol('sym_resistor', 100, 100);
        const sym = useSchematicStore.getState().symbols[0];
        store.selectSymbol(sym.id);

        store.addWire([{ x: 120, y: 80 }, { x: 50, y: 50 }]);

        // Rotate 90 deg around center.
        // (0, -60) -> (60, 0).
        // New abs tip: (120+60, 140+0) = (180, 140).
        store.rotateSelected();

        const updatedWire = useSchematicStore.getState().wires[0];
        expect(updatedWire.points[0].x).toBeCloseTo(180, 0);
        expect(updatedWire.points[0].y).toBeCloseTo(140, 0);
    });

    it('should flip wire endpoints when a symbol is mirrored', () => {
        const store = useSchematicStore.getState();
        // sym_esp32 width = 160. cx = 80.
        // pin gpio34 is at (0, 60), orientation 'left', length 20.
        // Tip is at (-20, 60) rel origin.
        // rel x to center = -20 - 80 = -100.
        // mirrored => rel x = 100.
        // absolute x = 0 + 80 + 100 = 180.
        store.addSymbol('sym_esp32', 0, 0);
        const sym = useSchematicStore.getState().symbols[0];
        store.selectSymbol(sym.id);

        // Connect wire to gpio34 tip at (-20, 60)
        store.addWire([{ x: -20, y: 60 }, { x: -50, y: 60 }]);

        store.flipSelected();

        const updatedWire = useSchematicStore.getState().wires[0];
        expect(updatedWire.points[0].x).toBe(180);
        expect(updatedWire.points[0].y).toBe(60);
    });
});
