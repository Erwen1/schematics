import { describe, it, expect } from 'vitest';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { SchematicState } from '../../store/schematicStore';
import { SymbolInstance, Wire } from '../../data/types';

describe('Phase 6.1: AI Validation — Stress Test', () => {

    it('Step 1: Generative Instantiation — Create ESP32 with BME280', () => {
        const prompt = "Create ESP32 with BME280 over I2C";
        const { symbols, wires } = generateFromPrompt(prompt, []);

        expect(symbols.length).toBe(2);
        const esp32 = symbols.find(s => s.symbolRef === 'sym_esp32');
        const bme280 = symbols.find(s => s.symbolRef === 'sym_bme280');

        expect(esp32).toBeDefined();
        expect(bme280).toBeDefined();

        // Check I2C Wires
        const sdaWire = wires.find(w => w.netId === 'SDA');
        const sclWire = wires.find(w => w.netId === 'SCL');
        expect(sdaWire).toBeDefined();
        expect(sclWire).toBeDefined();

        // Check Power Wires
        expect(wires.find(w => w.netId === '3V3')).toBeDefined();
        expect(wires.find(w => w.netId === 'GND')).toBeDefined();
    });

    it('Step 2: Logical Command Resolution — Add Pull-ups', () => {
        // Start with existing symbols
        const initial = generateFromPrompt("Create ESP32 with BME280 over I2C", []);

        const prompt = "Add 4.7k pull-ups to SDA and SCL";
        const { symbols, wires } = generateFromPrompt(prompt, initial.symbols);

        expect(symbols.length).toBe(2); // Two pull-up resistors
        expect(symbols[0].symbolRef).toBe('sym_resistor');
        expect(symbols[0].properties.value).toBe('4.7k');

        const sdaPullup = wires.find(w => w.netId === 'SDA');
        const vccPullup = wires.find(w => w.netId === '3V3');
        expect(sdaPullup).toBeDefined();
        expect(vccPullup).toBeDefined();
    });

    it('Step 3: Multi-Drop I2C — Add OLED to same bus', () => {
        const initial = generateFromPrompt("Create ESP32 with BME280 over I2C", []);
        const prompt = "Add OLED display via I2C on same bus";

        const { symbols, wires } = generateFromPrompt(prompt, initial.symbols);

        expect(symbols.length).toBe(1); // Just the OLED
        expect(symbols[0].symbolRef).toBe('sym_oled');

        // Verify it uses the EXISTING SDA/SCL net names
        expect(wires.some(w => w.netId === 'SDA')).toBe(true);
        expect(wires.some(w => w.netId === 'SCL')).toBe(true);
    });

});
