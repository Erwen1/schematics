import { describe, it, expect, beforeEach } from 'vitest';
import { useSchematicStore } from '../../store/schematicStore';

describe('State Consistency — Hard Validation', () => {

    beforeEach(() => {
        useSchematicStore.getState().newProject();
    });

    it('Action -> Undo should return to identical state hash', () => {
        const store = useSchematicStore.getState();
        const initialHash = store.getHash();

        // Perform complex actions
        store.addSymbol('sym_resistor', 100, 100);
        store.addSymbol('sym_capacitor', 200, 200);
        store.startWire({ x: 120, y: 100 });
        store.addWirePoint({ x: 200, y: 180 });
        store.finishWire();

        const modifiedHash = store.getHash();
        expect(modifiedHash).not.toBe(initialHash);

        // Undo all (Symbol1, Symbol2, Wire)
        store.undo(); // Undo finishWire
        store.undo(); // Undo addSymbol (sym_capacitor)
        store.undo(); // Undo addSymbol (sym_resistor)

        const finalHash = store.getHash();
        expect(finalHash).toBe(initialHash);
    });

    it('Save -> Load should preserve identical state hash', () => {
        const store = useSchematicStore.getState();

        // Setup a non-trivial project
        store.addSymbol('sym_resistor', 100, 100);
        store.addNetLabel(100, 100, 'VCC');
        store.addJunction(120, 100);
        store.recalculateNets();

        const originalHash = store.getHash();
        const saveString = store.saveProject();

        // Clear and reload
        store.newProject();
        expect(store.getHash()).not.toBe(originalHash);

        store.loadProject(saveString);
        store.recalculateNets(); // Recompute results

        const reloadedHash = store.getHash();
        expect(reloadedHash).toBe(originalHash);
    });

    it('Undo -> Redo should return to identical state hash', () => {
        const store = useSchematicStore.getState();

        store.addSymbol('sym_resistor', 100, 100);
        const stateA = store.getHash();

        store.addSymbol('sym_capacitor', 200, 200);
        const stateB = store.getHash();

        store.undo();
        expect(store.getHash()).toBe(stateA);

        store.redo();
        expect(store.getHash()).toBe(stateB);
    });
});
