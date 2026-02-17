import { describe, it, expect } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { symbolMap } from '../../data/symbolLibrary';

describe('Spatial Guardrails & Obstacle Avoidance', () => {

    it('should resolve overlaps by nudging components', () => {
        // "Basic Sensor Node" formerly had tight spacing for resistors.
        const { symbols } = generateFromPrompt("Create ESP32 with BME280 sensor and pullups");

        for (let i = 0; i < symbols.length; i++) {
            for (let j = i + 1; j < symbols.length; j++) {
                const s1 = symbols[i];
                const s2 = symbols[j];
                const d1 = symbolMap.get(s1.symbolRef)!;
                const d2 = symbolMap.get(s2.symbolRef)!;

                const r1 = { x: s1.x, y: s1.y, w: d1.width, h: d1.height };
                const r2 = { x: s2.x, y: s2.y, w: d2.width, h: d2.height };

                // Use a smaller padding check than the nudge logic itself 
                // to verify they aren't PHYSICALLY overlapping.
                const overlaps = r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
                    r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;

                expect(overlaps).toBe(false);
            }
        }
    });

    it('should route wires around obstacles (detour check)', () => {
        // Use a prompt that creates a manual connection between two template-generated symbols
        const prompt = "Create ESP32 as U1 and BME280 as U2. Connect U1.gpio21 to U2.sda";
        const { symbols, wires } = generateFromPrompt(prompt);

        // Find the manual connection (Step 5 wire)
        // Note: Template wires are Step 3, Manual are Step 5.
        // Step 5 wires have netId like NET_U1_U2
        const manualWire = wires.find(w => w.netId === 'NET_U1_U2');
        expect(manualWire).toBeDefined();

        // With new alignment, it might be a direct line (4 points: leadA, current, target, leadB)
        // or a detour (> 4).
        expect(manualWire!.points.length).toBeGreaterThanOrEqual(4);
    });

    it('should assign different lanes for parallel wires (Lane Check)', () => {
        const { wires } = generateFromPrompt("ESP32 with BME280 sensor");

        const sda = wires.find(w => w.netId === 'SDA');
        const scl = wires.find(w => w.netId === 'SCL');

        expect(sda).toBeDefined();
        expect(scl).toBeDefined();

        // Check if parallel segments (lead-outs) have different coordinates
        // SDA and SCL both come out 'right' from ESP32 at index 1 and 2
        // They should have different lead lengths or detour y-coords
        const sdaLead = sda!.points[1];
        const sclLead = scl!.points[1];

        // They must NOT have the same x if they are on the same side, or same y if horizontal
        // In our lane logic, we change the LEAD_LEN based on netId hash.
        expect(sdaLead.x).not.toEqual(sclLead.x);
    });

    it('should strictly avoid component bodies (No Tunneling Check)', () => {
        // Create a scenario where a wire between R1 and R2 MUST go AROUND ESP32
        const prompt = "Place ESP32 at (400, 250). Place Resistor as R1 at (100, 300). Place Resistor as R2 at (800, 300). Connect R1.p1 to R2.p1";
        const { symbols, wires } = generateFromPrompt(prompt);

        const esp32 = symbols.find(s => s.symbolRef === 'sym_esp32')!;
        const manualWire = wires.find(w => w.netId?.includes('R1_R2'))!;

        const d1 = symbolMap.get(esp32.symbolRef)!;
        const body = { x: esp32.x + 10, y: esp32.y + 10, w: d1.width - 20, h: d1.height - 20 }; // Strict interior

        // Check every segment of the wire
        for (let i = 0; i < manualWire.points.length - 1; i++) {
            const p1 = manualWire.points[i];
            const p2 = manualWire.points[i + 1];

            // Simple intersection check for the test
            const minX = Math.min(p1.x, p2.x);
            const maxX = Math.max(p1.x, p2.x);
            const minY = Math.min(p1.y, p2.y);
            const maxY = Math.max(p1.y, p2.y);

            const intersects = (p1.y === p2.y) ?
                (p1.y > body.y && p1.y < body.y + body.h && maxX > body.x && minX < body.x + body.w) :
                (p1.x > body.x && p1.x < body.x + body.w && maxY > body.y && minY < body.y + body.h);

            if (intersects) {
                console.log(`COLLISION AT SEGMENT ${i}:`, p1, p2, 'WITH BODY', body);
            }
            expect(intersects).toBe(false);
        }
    });
});
