import { describe, it, expect, beforeEach } from 'vitest';
import { useSchematicStore } from '../../store/schematicStore';
import { usePcbStore } from '../../store/pcbStore';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { computeRatsnest } from '../../engine/ratsnest';

describe('Phase 6.1: PCB & Determinism Validation', () => {

    beforeEach(() => {
        useSchematicStore.setState({
            symbols: [],
            wires: [],
            junctions: [],
            netLabels: [],
            nets: [],
            selectedIds: []
        });
        usePcbStore.setState({
            footprints: [],
            traces: [],
            vias: [],
            ratsnest: [],
            violations: []
        });
    });

    it('Step 5: PCB Import — Verify nets and ratsnest', () => {
        const result = generateFromPrompt("Create ESP32 with BME280 over I2C");
        useSchematicStore.getState().addGeneratedSubsystem(result.symbols, result.wires);

        const updatedSch = useSchematicStore.getState();
        usePcbStore.getState().importFromSchematic(updatedSch.symbols, updatedSch.nets, updatedSch.netClasses);

        const updatedPcb = usePcbStore.getState();
        expect(updatedPcb.footprints.length).toBe(2);
        expect(updatedPcb.ratsnest.length).toBeGreaterThan(0);
    });

    it('Step 6: Determinism — Verify Hash Parity', () => {
        const schStore = useSchematicStore.getState();
        const hash0 = schStore.getHash();
        schStore.addSymbol('sym_resistor', 100, 100);
        const hash1 = useSchematicStore.getState().getHash();
        expect(hash1).not.toBe(hash0);
        useSchematicStore.getState().undo();
        const hash2 = useSchematicStore.getState().getHash();
        expect(hash2).toBe(hash0);
        useSchematicStore.getState().redo();
        const hash3 = useSchematicStore.getState().getHash();
        expect(hash3).toBe(hash1);
    });

    it('PCB Auto-Placement — Verify Stress Reduction', () => {
        const result = generateFromPrompt("Create ESP32 with BME280 over I2C");
        useSchematicStore.getState().addGeneratedSubsystem(result.symbols, result.wires);

        const currentSch = useSchematicStore.getState();
        usePcbStore.getState().importFromSchematic(currentSch.symbols, currentSch.nets, currentSch.netClasses);

        // DELIBERATELY induce a high-stress state by moving components far apart
        usePcbStore.setState((s) => ({
            footprints: s.footprints.map((f, i) => ({
                ...f,
                x: i * 500, // Move 500mm apart
                y: i * 500
            }))
        }));

        // Re-calculate ratsnest for this "bad" initial state
        const badPcb = usePcbStore.getState();
        const badRats = computeRatsnest(badPcb.footprints, [], currentSch.nets);
        const initialLength = badRats.reduce((acc, r) => {
            const dx = r.from.x - r.to.x;
            const dy = r.from.y - r.to.y;
            return acc + Math.sqrt(dx * dx + dy * dy);
        }, 0);

        expect(initialLength).toBeGreaterThan(100); // Should be very large

        // Run Auto-placement with these bad coordinates
        // We override the store state first
        usePcbStore.setState({ ratsnest: badRats });
        usePcbStore.getState().performAutoPlace();

        // New length
        const finalPcb = usePcbStore.getState();
        const finalRats = computeRatsnest(finalPcb.footprints, [], currentSch.nets);

        const finalLength = finalRats.reduce((acc, r) => {
            const dx = r.from.x - r.to.x;
            const dy = r.from.y - r.to.y;
            return acc + Math.sqrt(dx * dx + dy * dy);
        }, 0);

        // Expect SIGNIFICANT reduction
        expect(finalLength).toBeLessThan(initialLength / 2);
    });

});
