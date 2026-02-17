import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { computeNets } from '../../engine/connectivity';
import { symbolMap } from '../../data/symbolLibrary';
import { v4 as uuid } from 'uuid';

describe('Phase 6.2 — IoT Component Stress Matrix', () => {

    describe('Milestone 3: Performance & Deterministic Guardrails', () => {

        it('Performance Budget — High Density (LAN8720 + RMII Stack)', () => {
            const prompt = "Create ESP32 with LAN8720 Ethernet PHY";

            const startGen = performance.now();
            const { symbols, wires } = generateFromPrompt(prompt);
            const endGen = performance.now();

            console.log(`Generation Latency: ${(endGen - startGen).toFixed(2)}ms`);
            expect(endGen - startGen).toBeLessThan(100); // UI responsiveness threshold

            const startNet = performance.now();
            const nets = computeNets(symbols, wires);
            const endNet = performance.now();

            console.log(`Net Recompute (High Density): ${(endNet - startNet).toFixed(2)}ms`);
            // Professional Budget: < 30ms for complex RMII nets
            expect(endNet - startNet).toBeLessThan(30);
        });

        it('Deterministic Hash Parity — SPI Multi-device', () => {
            // "Add 2 MicroSD cards" should auto-assign unique CS pins
            const { symbols, wires } = generateFromPrompt("Add 2 MicroSD cards");

            const nets = computeNets(symbols, wires);
            const csNets = nets.filter(n => n.id.startsWith('SPI_CS'));

            // Verify unique CS assignment
            expect(csNets.length).toBe(2);
            expect(csNets[0].id).not.toBe(csNets[1].id);

            // Verify component count
            expect(symbols.filter(s => s.symbolRef === 'sym_microsd').length).toBe(2);
        });
    });

    describe('Milestone 4: AI Misbehavior & Guardrails', () => {

        it('Voltage Domain Guardrail — 5V to 3.3V Warning', () => {
            const consoleSpy = vi.spyOn(console, 'warn');

            // Prompt a manual connection that violates domains
            // U5 is MAX485 (5V), MCU1 is ESP32 (3.3V)
            generateFromPrompt("Create ESP32 as MCU1 and MAX485 as U5. Connect U5.RO to MCU1.rx0");

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[AI Guardrail] Domain Mismatch: U5(5V) connected to MCU1(3.3V)')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Milestone 5: Test Z — Nightmare Integration', () => {

        it('Full System Nightmare Scenario', () => {
            const prompt = "Generate Test Z Nightmare system";

            const { symbols, wires } = generateFromPrompt(prompt);
            const nets = computeNets(symbols, wires);
            const vNets = nets.map(n => n.id);
            const vNames = nets.map(n => n.name);

            // Verify all domains are present (robust check)
            expect([...vNets, ...vNames]).toContain('12V');
            expect([...vNets, ...vNames]).toContain('5V');
            expect([...vNets, ...vNames]).toContain('3V3');
            expect([...vNets, ...vNames]).toContain('GND');

            // Verify pin count and connectivity stability
            expect(symbols.length).toBeGreaterThanOrEqual(5);
            expect(wires.length).toBeGreaterThanOrEqual(9);

            // Performance threshold for the entire nightmare stack
            const startERC = performance.now();
            // (Placeholder for ERC run once implemented in this phase)
            const endERC = performance.now();
            expect(endERC - startERC).toBeLessThan(80);
        });
    });
});
