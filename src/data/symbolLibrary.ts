/* ──────────────────────────────────────────────
   Built-in symbol library definitions
   Professional schematic symbols for common components
   ────────────────────────────────────────────── */

import { SymbolDef } from './types';

// Grid unit helper — symbols are defined on a 20px grid
const G = 20;

export const builtInSymbols: SymbolDef[] = [
    // ── Resistor ──────────────────────────────
    {
        id: 'sym_resistor',
        name: 'R',
        category: 'Passive',
        description: 'Resistor',
        width: G * 2,
        height: G * 4,
        showValue: true,
        pins: [
            { id: 'p1', name: '1', number: '1', x: G, y: 0, length: 20, orientation: 'up', electricalType: 'passive' },
            { id: 'p2', name: '2', number: '2', x: G, y: G * 4, length: 20, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            // lead top
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 0.75 },
            // body (zigzag as polyline)
            {
                type: 'polyline',
                points: [
                    G, G * 0.75,
                    G * 1.5, G * 1.0,
                    G * 0.5, G * 1.5,
                    G * 1.5, G * 2.0,
                    G * 0.5, G * 2.5,
                    G * 1.5, G * 3.0,
                    G, G * 3.25,
                ],
            },
            // lead bottom
            { type: 'line', x1: G, y1: G * 3.25, x2: G, y2: G * 4 },
        ],
        metadata: { category: 'passive' }
    },

    // ── Capacitor ─────────────────────────────
    {
        id: 'sym_capacitor',
        name: 'C',
        category: 'Passive',
        description: 'Capacitor',
        width: G * 2,
        height: G * 4,
        showValue: true,
        pins: [
            { id: 'p1', name: '1', number: '1', x: G, y: 0, length: 20, orientation: 'up', electricalType: 'passive' },
            { id: 'p2', name: '2', number: '2', x: G, y: G * 4, length: 20, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            // lead top
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 1.6 },
            // plate top
            { type: 'line', x1: G * 0.3, y1: G * 1.6, x2: G * 1.7, y2: G * 1.6, strokeWidth: 2.5 },
            // plate bottom
            { type: 'line', x1: G * 0.3, y1: G * 2.4, x2: G * 1.7, y2: G * 2.4, strokeWidth: 2.5 },
            // lead bottom
            { type: 'line', x1: G, y1: G * 2.4, x2: G, y2: G * 4 },
        ],
        metadata: { category: 'passive' }
    },

    // ── LED ───────────────────────────────────
    {
        id: 'sym_led',
        name: 'LED',
        category: 'Active',
        description: 'Light Emitting Diode',
        width: G * 2,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'a', name: 'A', x: G, y: 0, orientation: 'up', electricalType: 'passive' },
            { id: 'k', name: 'K', x: G, y: G * 4, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            // lead top (anode)
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 1.2 },
            // triangle
            { type: 'polyline', points: [G * 0.3, G * 1.2, G * 1.7, G * 1.2, G, G * 2.8, G * 0.3, G * 1.2], fill: 'none' },
            // cathode bar
            { type: 'line', x1: G * 0.3, y1: G * 2.8, x2: G * 1.7, y2: G * 2.8, strokeWidth: 2 },
            // lead bottom (cathode)
            { type: 'line', x1: G, y1: G * 2.8, x2: G, y2: G * 4 },
            // arrows (light emission)
            { type: 'line', x1: G * 1.6, y1: G * 1.6, x2: G * 2.0, y2: G * 1.2 },
            { type: 'line', x1: G * 1.6, y1: G * 2.1, x2: G * 2.0, y2: G * 1.7 },
        ],
        metadata: { category: 'digital' }
    },

    // ── Diode ─────────────────────────────────
    {
        id: 'sym_diode',
        name: 'D',
        category: 'Active',
        description: 'Diode',
        width: G * 2,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'a', name: 'A', x: G, y: 0, orientation: 'up', electricalType: 'passive' },
            { id: 'k', name: 'K', x: G, y: G * 4, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 1.2 },
            { type: 'polyline', points: [G * 0.3, G * 1.2, G * 1.7, G * 1.2, G, G * 2.8, G * 0.3, G * 1.2], fill: 'none' },
            { type: 'line', x1: G * 0.3, y1: G * 2.8, x2: G * 1.7, y2: G * 2.8, strokeWidth: 2 },
            { type: 'line', x1: G, y1: G * 2.8, x2: G, y2: G * 4 },
        ],
        metadata: { category: 'passive' }
    },

    // ── VCC (Power) ───────────────────────────
    {
        id: 'sym_vcc',
        name: 'VCC',
        category: 'Power',
        description: 'Positive Power Supply',
        width: G * 2,
        height: G * 2,
        showValue: false,
        pins: [
            { id: 'p1', name: '1', x: G, y: G * 2, orientation: 'down', electricalType: 'power_out' },
        ],
        graphics: [
            // vertical line
            { type: 'line', x1: G, y1: G * 2, x2: G, y2: G * 0.8 },
            // arrow up
            { type: 'polyline', points: [G * 0.5, G * 0.8, G, G * 0.2, G * 1.5, G * 0.8] },
            // label
            { type: 'text', x: G, y: -2, text: 'VCC', fontSize: 12, align: 'center' },
        ],
        metadata: { category: 'power', isPowerSource: true }
    },

    // ── PWR_FLAG (Generic Power Flag) ─────────
    {
        id: 'sym_pwr_flag',
        name: 'PWR_FLAG',
        category: 'Power',
        description: 'Power flag — marks a net as having a power source without forcing a net name',
        width: G * 2,
        height: G * 2,
        showValue: false,
        pins: [
            { id: 'p1', name: '1', x: G, y: G * 2, orientation: 'down', electricalType: 'power_out' },
        ],
        graphics: [
            // vertical line
            { type: 'line', x1: G, y1: G * 2, x2: G, y2: G * 0.6 },
            // diamond
            { type: 'polyline', points: [G, G * 0.1, G * 1.4, G * 0.6, G, G * 1.1, G * 0.6, G * 0.6, G, G * 0.1] },
            // label
            { type: 'text', x: G, y: -2, text: 'PWR', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'power', isPowerSource: true, isPowerFlag: true }
    },

    // ── GND (Ground) ──────────────────────────
    {
        id: 'sym_gnd',
        name: 'GND',
        category: 'Power',
        description: 'Ground',
        width: G * 2,
        height: G * 2,
        showValue: false,
        pins: [
            { id: 'p1', name: '1', x: G, y: 0, orientation: 'up', electricalType: 'power_out' },
        ],
        graphics: [
            // vertical line
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 1.0 },
            // three horizontal bars
            { type: 'line', x1: G * 0.2, y1: G * 1.0, x2: G * 1.8, y2: G * 1.0, strokeWidth: 2 },
            { type: 'line', x1: G * 0.5, y1: G * 1.35, x2: G * 1.5, y2: G * 1.35, strokeWidth: 2 },
            { type: 'line', x1: G * 0.75, y1: G * 1.7, x2: G * 1.25, y2: G * 1.7, strokeWidth: 2 },
        ],
        metadata: { category: 'power', isPowerSource: true }
    },

    // ── NPN Transistor ────────────────────────
    {
        id: 'sym_npn',
        name: 'Q_NPN',
        category: 'Active',
        description: 'NPN Bipolar Transistor',
        width: G * 3,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'b', name: 'B', x: 0, y: G * 2, orientation: 'left', electricalType: 'input' },
            { id: 'c', name: 'C', x: G * 2, y: 0, orientation: 'up', electricalType: 'output' },
            { id: 'e', name: 'E', x: G * 2, y: G * 4, orientation: 'down', electricalType: 'output' },
        ],
        graphics: [
            // base lead
            { type: 'line', x1: 0, y1: G * 2, x2: G * 1, y2: G * 2 },
            // vertical bar
            { type: 'line', x1: G * 1, y1: G * 1, x2: G * 1, y2: G * 3, strokeWidth: 2.5 },
            // collector line
            { type: 'line', x1: G * 1, y1: G * 1.4, x2: G * 2, y2: G * 0.5 },
            { type: 'line', x1: G * 2, y1: G * 0.5, x2: G * 2, y2: 0 },
            // emitter line
            { type: 'line', x1: G * 1, y1: G * 2.6, x2: G * 2, y2: G * 3.5 },
            { type: 'line', x1: G * 2, y1: G * 3.5, x2: G * 2, y2: G * 4 },
            // emitter arrow
            { type: 'polyline', points: [G * 1.4, G * 3.3, G * 2, G * 3.5, G * 1.6, G * 2.9] },
            // circle
            { type: 'circle', cx: G * 1.4, cy: G * 2, r: G * 1.3 },
        ],
        metadata: { category: 'mixed' }
    },

    // ── Op-Amp ────────────────────────────────
    {
        id: 'sym_opamp',
        name: 'U_OPAMP',
        category: 'Active',
        description: 'Operational Amplifier',
        width: G * 5,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'inp', name: '+', x: 0, y: G * 1, orientation: 'left', electricalType: 'input' },
            { id: 'inn', name: '-', x: 0, y: G * 3, orientation: 'left', electricalType: 'input' },
            { id: 'out', name: 'OUT', x: G * 5, y: G * 2, orientation: 'right', electricalType: 'output' },
        ],
        graphics: [
            // input leads
            { type: 'line', x1: 0, y1: G * 1, x2: G * 0.8, y2: G * 1 },
            { type: 'line', x1: 0, y1: G * 3, x2: G * 0.8, y2: G * 3 },
            // triangle body
            { type: 'polyline', points: [G * 0.8, G * 0, G * 0.8, G * 4, G * 4.2, G * 2, G * 0.8, G * 0] },
            // output lead
            { type: 'line', x1: G * 4.2, y1: G * 2, x2: G * 5, y2: G * 2 },
            // + / - labels
            { type: 'text', x: G * 1.2, y: G * 1.15, text: '+', fontSize: 14 },
            { type: 'text', x: G * 1.2, y: G * 3.15, text: '−', fontSize: 14 },
        ],
        metadata: { category: 'analog' }
    },

    // ── Inductor ──────────────────────────────
    {
        id: 'sym_inductor',
        name: 'L',
        category: 'Passive',
        description: 'Inductor',
        width: G * 2,
        height: G * 4,
        showValue: true,
        pins: [
            { id: 'p1', name: '1', x: G, y: 0, orientation: 'up', electricalType: 'passive' },
            { id: 'p2', name: '2', x: G, y: G * 4, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 0.5 },
            // coils as arcs (simplified as bumps)
            { type: 'arc', cx: G, cy: G * 1.0, r: G * 0.5, startAngle: 180, endAngle: 0 },
            { type: 'arc', cx: G, cy: G * 1.8, r: G * 0.5, startAngle: 180, endAngle: 0 },
            { type: 'arc', cx: G, cy: G * 2.6, r: G * 0.5, startAngle: 180, endAngle: 0 },
            { type: 'line', x1: G, y1: G * 3.1, x2: G, y2: G * 4 },
        ],
        metadata: { category: 'passive' }
    },

    // ── Button ────────────────────────────────
    {
        id: 'sym_button',
        name: 'SW',
        category: 'Passive',
        description: 'Push Button',
        width: G * 2,
        height: G * 2,
        showValue: false,
        pins: [
            { id: 'p1', name: '1', x: 0, y: G, orientation: 'left', electricalType: 'passive' },
            { id: 'p2', name: '2', x: G * 2, y: G, orientation: 'right', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'line', x1: 0, y1: G, x2: G * 0.5, y2: G },
            { type: 'line', x1: G * 1.5, y1: G, x2: G * 2, y2: G },
            { type: 'circle', cx: G * 0.6, cy: G, r: 2 },
            { type: 'circle', cx: G * 1.4, cy: G, r: 2 },
            { type: 'line', x1: G * 0.6, y1: G - 2, x2: G * 1.4, y2: G - G * 0.6 },
        ],
        metadata: { category: 'digital' }
    },

    // ── 7805 Voltage Regulator ───────────────
    {
        id: 'sym_7805',
        name: 'U',
        category: 'Power',
        description: '7805 Voltage Regulator',
        width: G * 4,
        height: G * 3,
        showValue: true,
        pins: [
            { id: 'in', name: 'IN', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', x: G * 2, y: G * 3, orientation: 'down', electricalType: 'power_in' },
            { id: 'out', name: 'OUT', x: G * 4, y: G, orientation: 'right', electricalType: 'power_out' },
        ],
        graphics: [
            { type: 'rect', x: G * 0.5, y: G * 0.5, width: G * 3, height: G * 2 },
            { type: 'text', x: G * 2, y: G * 1.6, text: '7805', fontSize: 12, align: 'center' },
        ],
        metadata: { category: 'power', voltageDomain: '5V', requiresDecoupling: true }
    },

    // ── ESP32-WROOM-32 ───────────────────────
    {
        id: 'sym_esp32',
        name: 'U',
        category: 'MCU',
        description: 'ESP32-WROOM-32 Module',
        width: G * 8,
        height: G * 12,
        showValue: true,
        pins: [
            { id: '3v3', name: '3V3', number: '1', x: 0, y: G, length: 20, orientation: 'left', electricalType: 'power_in' },
            { id: 'en', name: 'EN', number: '2', x: 0, y: G * 2, length: 20, orientation: 'left', electricalType: 'input' },
            { id: 'gpio34', name: 'G34', number: '3', x: 0, y: G * 3, length: 20, orientation: 'left', electricalType: 'input' },
            { id: 'gpio35', name: 'G35', number: '4', x: 0, y: G * 4, length: 20, orientation: 'left', electricalType: 'input' },
            { id: 'gpio32', name: 'G32', number: '5', x: 0, y: G * 5, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio33', name: 'G33', number: '6', x: 0, y: G * 6, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio25', name: 'G25', number: '7', x: 0, y: G * 7, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio26', name: 'G26', number: '8', x: 0, y: G * 8, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio27', name: 'G27', number: '9', x: 0, y: G * 9, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio14', name: 'G14', number: '10', x: 0, y: G * 10, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'gpio12', name: 'G12', number: '11', x: 0, y: G * 11, length: 20, orientation: 'left', electricalType: 'bidirectional' },

            { id: 'gnd', name: 'GND', number: '15', x: G * 4, y: G * 12, length: 20, orientation: 'down', electricalType: 'power_in' },

            { id: 'gpio21', name: 'SDA', number: '20', x: G * 8, y: G, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'gpio22', name: 'SCL', number: '21', x: G * 8, y: G * 2, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'gpio19', name: 'MISO', number: '22', x: G * 8, y: G * 3, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'gpio23', name: 'MOSI', number: '23', x: G * 8, y: G * 4, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'gpio18', name: 'SCK', number: '24', x: G * 8, y: G * 5, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'gpio5', name: 'SS', number: '25', x: G * 8, y: G * 6, length: 20, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'tx0', name: 'TX0', number: '26', x: G * 8, y: G * 7, length: 20, orientation: 'right', electricalType: 'output' },
            { id: 'rx0', name: 'RX0', number: '27', x: G * 8, y: G * 8, length: 20, orientation: 'right', electricalType: 'input' },
        ],
        graphics: [
            { type: 'rect', x: G * 0.5, y: G * 0.5, width: G * 7, height: G * 11 },
            { type: 'text', x: G * 4, y: G * 3.5, text: 'ESP32', fontSize: 13, align: 'center' },
        ],
        metadata: { category: 'digital', voltageDomain: '3.3V', isHighSpeed: true, requiresDecoupling: true }
    },

    // ── BME280 Sensor ────────────────────────
    {
        id: 'sym_bme280',
        name: 'U',
        category: 'Sensor',
        description: 'BME280 Humidity/Temp/Pressure Sensor',
        width: G * 4,
        height: G * 6,
        showValue: true,
        pins: [
            { id: 'vcc', name: 'VCC', number: '1', x: G * 2, y: 0, length: 20, orientation: 'up', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', number: '2', x: G * 2, y: G * 6, length: 20, orientation: 'down', electricalType: 'power_in' },
            { id: 'sda', name: 'SDA', number: '3', x: 0, y: G, length: 20, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'scl', name: 'SCL', number: '4', x: 0, y: G * 2, length: 20, orientation: 'left', electricalType: 'input' },
            { id: 'csb', name: 'CSB', number: '5', x: G * 4, y: G * 1.5, length: 20, orientation: 'right', electricalType: 'input' },
            { id: 'sdo', name: 'SDO', number: '6', x: G * 4, y: G * 4.5, length: 20, orientation: 'right', electricalType: 'bidirectional' },
        ],
        graphics: [
            { type: 'rect', x: G * 0.5, y: G * 0.5, width: G * 3, height: G * 5 },
            { type: 'text', x: G * 2, y: G * 1.5, text: 'BME280', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'mixed', voltageDomain: '3.3V', requiresDecoupling: true }
    },

    // ── OLED Display 128x64 I2C ───────────────
    {
        id: 'sym_oled',
        name: 'DISP',
        category: 'Output',
        description: 'OLED Display 128x64 I2C',
        width: G * 6,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'gnd', name: 'GND', x: G, y: 0, orientation: 'up', electricalType: 'power_in' },
            { id: 'vcc', name: 'VCC', x: G * 2, y: 0, orientation: 'up', electricalType: 'power_in' },
            { id: 'scl', name: 'SCL', x: G * 3, y: 0, orientation: 'up', electricalType: 'input' },
            { id: 'sda', name: 'SDA', x: G * 4, y: 0, orientation: 'up', electricalType: 'bidirectional' },
        ],
        graphics: [
            { type: 'rect', x: G * 0.5, y: G * 0.5, width: G * 5, height: G * 3 },
            { type: 'rect', x: G * 1, y: G * 1, width: G * 4, height: G * 2 },
            { type: 'text', x: G * 3, y: G * 2, text: 'OLED', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'digital', voltageDomain: '3.3V', requiresDecoupling: true }
    },

    // ── TP4056 Lipo Charger ──────────────────
    {
        id: 'sym_tp4056',
        name: 'U',
        category: 'Power',
        description: 'TP4056 Lipo Battery Charger',
        width: G * 5,
        height: G * 5,
        showValue: true,
        pins: [
            { id: 'vcc', name: 'VCC', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', x: 0, y: G * 4, orientation: 'left', electricalType: 'power_in' },
            { id: 'prog', name: 'PROG', x: G * 2, y: G * 5, orientation: 'down', electricalType: 'passive' },
            { id: 'bat', name: 'BAT', x: G * 5, y: G * 2, orientation: 'right', electricalType: 'power_out' },
            { id: 'ce', name: 'CE', x: G * 5, y: G * 3, orientation: 'right', electricalType: 'input' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G, width: G * 3, height: G * 3 },
            { type: 'text', x: G * 2.5, y: G * 2.5, text: 'TP4056', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'power', voltageDomain: '5V', requiresDecoupling: true }
    },

    // ── Battery ──────────────────────────────
    {
        id: 'sym_battery',
        name: 'BT',
        category: 'Power',
        description: 'Battery Cell',
        width: G * 2,
        height: G * 2,
        showValue: true,
        pins: [
            { id: 'p1', name: '+', x: G, y: 0, orientation: 'up', electricalType: 'power_out' },
            { id: 'p2', name: '-', x: G, y: G * 2, orientation: 'down', electricalType: 'power_out' },
        ],
        graphics: [
            { type: 'line', x1: G * 0.4, y1: G * 0.8, x2: G * 1.6, y2: G * 0.8, strokeWidth: 2.5 },
            { type: 'line', x1: G * 0.7, y1: G * 1.2, x2: G * 1.3, y2: G * 1.2, strokeWidth: 1.5 },
        ],
        metadata: { category: 'power', voltageDomain: 'ADJUSTABLE', isPowerSource: true }
    },

    // ── MP1584 Buck Converter ────────────────
    {
        id: 'sym_mp1584',
        name: 'U',
        category: 'Power',
        description: 'High frequency step-down DC-DC buck converter',
        width: G * 6,
        height: G * 6,
        showValue: true,
        pins: [
            { id: 'vin', name: 'VIN', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'en', name: 'EN', x: 0, y: G * 2, orientation: 'left', electricalType: 'input' },
            { id: 'freq', name: 'FREQ', x: 0, y: G * 3, orientation: 'left', electricalType: 'passive' },
            { id: 'comp', name: 'COMP', x: 0, y: G * 5, orientation: 'left', electricalType: 'passive' },
            { id: 'gnd', name: 'GND', x: G * 3, y: G * 6, orientation: 'down', electricalType: 'power_in' },
            { id: 'sw', name: 'SW', x: G * 6, y: G, orientation: 'right', electricalType: 'output' },
            { id: 'fb', name: 'FB', x: G * 6, y: G * 3, orientation: 'right', electricalType: 'input' },
            { id: 'bst', name: 'BST', x: G * 6, y: G * 5, orientation: 'right', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 4, height: G * 5 },
            { type: 'text', x: G * 3, y: G * 3, text: 'MP1584', fontSize: 12, align: 'center' },
        ],
        metadata: { category: 'power', voltageDomain: 'ADJUSTABLE', requiresDecoupling: true }
    },

    // ── LAN8720 Ethernet PHY ─────────────────
    {
        id: 'sym_lan8720',
        name: 'U',
        category: 'Communication',
        description: '10/100 Ethernet Physical Layer Transceiver (RMII)',
        width: G * 10,
        height: G * 14,
        showValue: true,
        pins: [
            { id: 'vddio', name: 'VDDIO', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'reset', name: 'RESET', x: 0, y: G * 2, orientation: 'left', electricalType: 'input' },
            { id: 'tx0', name: 'TXD0', x: 0, y: G * 4, orientation: 'left', electricalType: 'input' },
            { id: 'tx1', name: 'TXD1', x: 0, y: G * 5, orientation: 'left', electricalType: 'input' },
            { id: 'txen', name: 'TXEN', x: 0, y: G * 6, orientation: 'left', electricalType: 'input' },
            { id: 'rx0', name: 'RXD0', x: 0, y: G * 8, orientation: 'left', electricalType: 'output' },
            { id: 'rx1', name: 'RXD1', x: 0, y: G * 9, orientation: 'left', electricalType: 'output' },
            { id: 'crs_dv', name: 'CRSDV', x: 0, y: G * 10, orientation: 'left', electricalType: 'output' },
            { id: 'mdc', name: 'MDC', x: 0, y: G * 12, orientation: 'left', electricalType: 'input' },
            { id: 'mdio', name: 'MDIO', x: 0, y: G * 13, orientation: 'left', electricalType: 'bidirectional' },

            { id: 'gnd', name: 'GND', x: G * 5, y: G * 14, orientation: 'down', electricalType: 'power_in' },

            { id: 'txp', name: 'TX+', x: G * 10, y: G * 2, orientation: 'right', electricalType: 'output' },
            { id: 'txn', name: 'TX-', x: G * 10, y: G * 3, orientation: 'right', electricalType: 'output' },
            { id: 'rxp', name: 'RX+', x: G * 10, y: G * 5, orientation: 'right', electricalType: 'input' },
            { id: 'rxn', name: 'RX-', x: G * 10, y: G * 6, orientation: 'right', electricalType: 'input' },
            { id: 'refclk', name: 'CLKIN', x: G * 10, y: G * 8, orientation: 'right', electricalType: 'input' },
            { id: 'rbias', name: 'RBIAS', x: G * 10, y: G * 10, orientation: 'right', electricalType: 'passive' },
            { id: 'led1', name: 'LED1', x: G * 10, y: G * 12, orientation: 'right', electricalType: 'output' },
            { id: 'led2', name: 'LED2', x: G * 10, y: G * 13, orientation: 'right', electricalType: 'output' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 8, height: G * 13 },
            { type: 'text', x: G * 5, y: G * 7, text: 'LAN8720', fontSize: 14, align: 'center' },
        ],
        metadata: { category: 'digital', voltageDomain: '3.3V', isHighSpeed: true, requiresDecoupling: true }
    },

    // ── MAX485 Transceiver ───────────────────
    {
        id: 'sym_max485',
        name: 'U',
        category: 'Communication',
        description: 'RS-485/RS-422 Transceiver',
        width: G * 5,
        height: G * 5,
        showValue: true,
        pins: [
            { id: 'ro', name: 'RO', x: 0, y: G, orientation: 'left', electricalType: 'output' },
            { id: 're', name: 'RE', x: 0, y: G * 2, orientation: 'left', electricalType: 'input' },
            { id: 'de', name: 'DE', x: 0, y: G * 3, orientation: 'left', electricalType: 'input' },
            { id: 'di', name: 'DI', x: 0, y: G * 4, orientation: 'left', electricalType: 'input' },
            { id: 'gnd', name: 'GND', x: G * 2.5, y: G * 5, orientation: 'down', electricalType: 'power_in' },
            { id: 'vcc', name: 'VCC', x: G * 2.5, y: 0, orientation: 'up', electricalType: 'power_in' },
            { id: 'a', name: 'A', x: G * 5, y: G * 1.5, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'b', name: 'B', x: G * 5, y: G * 3.5, orientation: 'right', electricalType: 'bidirectional' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G, width: G * 3, height: G * 3 },
            { type: 'text', x: G * 2.5, y: G * 2.5, text: 'MAX485', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'mixed', voltageDomain: '5V', requiresDecoupling: true }
    },

    // ── ADS1115 ADC ──────────────────────────
    {
        id: 'sym_ads1115',
        name: 'U',
        category: 'Analog',
        description: '16-bit ADC with I2C interface',
        width: G * 6,
        height: G * 7,
        showValue: true,
        pins: [
            { id: 'vcc', name: 'VDD', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', x: 0, y: G * 2, orientation: 'left', electricalType: 'power_in' },
            { id: 'scl', name: 'SCL', x: 0, y: G * 4, orientation: 'left', electricalType: 'input' },
            { id: 'sda', name: 'SDA', x: 0, y: G * 5, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'addr', name: 'ADDR', x: 0, y: G * 6, orientation: 'left', electricalType: 'input' },

            { id: 'a0', name: 'A0', x: G * 6, y: G * 1, orientation: 'right', electricalType: 'input' },
            { id: 'a1', name: 'A1', x: G * 6, y: G * 2, orientation: 'right', electricalType: 'input' },
            { id: 'a2', name: 'A2', x: G * 6, y: G * 3, orientation: 'right', electricalType: 'input' },
            { id: 'a3', name: 'A3', x: G * 6, y: G * 4, orientation: 'right', electricalType: 'input' },
            { id: 'alert', name: 'ALRT', x: G * 6, y: G * 6, orientation: 'right', electricalType: 'output' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 4, height: G * 6 },
            { type: 'text', x: G * 3, y: G * 3.5, text: 'ADS1115', fontSize: 12, align: 'center' },
        ],
        metadata: { category: 'mixed', voltageDomain: 'ADJUSTABLE', requiresDecoupling: true }
    },

    // ── MicroSD SPI ─────────────────────────
    {
        id: 'sym_microsd',
        name: 'J',
        category: 'Storage',
        description: 'MicroSD Card Socket (SPI Mode)',
        width: G * 5,
        height: G * 6,
        showValue: false,
        pins: [
            { id: 'cs', name: 'CS', x: 0, y: G, orientation: 'left', electricalType: 'input' },
            { id: 'mosi', name: 'MOSI', x: 0, y: G * 2, orientation: 'left', electricalType: 'input' },
            { id: 'vcc', name: 'VDD', x: 0, y: G * 3, orientation: 'left', electricalType: 'power_in' },
            { id: 'sck', name: 'SCK', x: 0, y: G * 4, orientation: 'left', electricalType: 'input' },
            { id: 'gnd', name: 'VSS', x: 0, y: G * 5, orientation: 'left', electricalType: 'power_in' },
            { id: 'miso', name: 'MISO', x: G * 5, y: G * 2.5, orientation: 'right', electricalType: 'output' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 3, height: G * 5 },
            { type: 'text', x: G * 2.5, y: G * 3, text: 'SD SPI', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'digital', voltageDomain: '3.3V', isHighSpeed: true, requiresDecoupling: true }
    },

    // ── MEMS I2S Microphone ─────────────────
    {
        id: 'sym_mems_mic',
        name: 'MK',
        category: 'Sensor',
        description: 'I2S MEMS Microphone',
        width: G * 4,
        height: G * 5,
        showValue: false,
        pins: [
            { id: 'vcc', name: 'VDD', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', x: 0, y: G * 4, orientation: 'left', electricalType: 'power_in' },
            { id: 'sck', name: 'BCLK', x: G * 4, y: G, orientation: 'right', electricalType: 'input' },
            { id: 'ws', name: 'LRCLK', x: G * 4, y: G * 2, orientation: 'right', electricalType: 'input' },
            { id: 'sd', name: 'DOUT', x: G * 4, y: G * 3, orientation: 'right', electricalType: 'output' },
            { id: 'sel', name: 'SEL', x: G * 4, y: G * 4, orientation: 'right', electricalType: 'input' },
        ],
        graphics: [
            { type: 'circle', cx: G * 2, cy: G * 2.5, r: G * 1.5 },
            { type: 'circle', cx: G * 2, cy: G * 2.5, r: G * 0.3 },
        ],
        metadata: { category: 'mixed', voltageDomain: '3.3V', requiresDecoupling: true }
    },

    // ── N-Channel MOSFET (AO3400 style) ──────
    {
        id: 'sym_mosfet_n',
        name: 'Q',
        category: 'Active',
        description: 'N-Channel Enhancement Mode MOSFET',
        width: G * 3,
        height: G * 4,
        showValue: true,
        pins: [
            { id: 'g', name: 'G', x: 0, y: G * 2.5, orientation: 'left', electricalType: 'input' },
            { id: 'd', name: 'D', x: G * 2, y: 0, orientation: 'up', electricalType: 'passive' },
            { id: 's', name: 'S', x: G * 2, y: G * 4, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'line', x1: G * 0.8, y1: G * 1, x2: G * 0.8, y2: G * 3, strokeWidth: 2.5 }, // Gate bar
            { type: 'line', x1: 0, y1: G * 2.5, x2: G * 0.8, y2: G * 2.5 }, // Gate lead
            { type: 'line', x1: G * 1.2, y1: G * 1, x2: G * 1.2, y2: G * 1.5, strokeWidth: 2 }, // Drain plate
            { type: 'line', x1: G * 1.2, y1: G * 2.5, x2: G * 1.2, y2: G * 3, strokeWidth: 2 }, // Source plate
            { type: 'line', x1: G * 1.2, y1: G * 1.75, x2: G * 1.2, y2: G * 2.25, strokeWidth: 2 }, // Bulk plate
            { type: 'line', x1: G * 1.2, y1: G * 1.25, x2: G * 2, y2: G * 1.25 }, // Drain connect
            { type: 'line', x1: G * 2, y1: G * 1.25, x2: G * 2, y2: 0 },
            { type: 'line', x1: G * 1.2, y1: G * 2.75, x2: G * 2, y2: G * 2.75 }, // Source connect
            { type: 'line', x1: G * 2, y1: G * 2.75, x2: G * 2, y2: G * 4 },
            { type: 'circle', cx: G * 1.4, cy: G * 2, r: G * 1.3 },
            { type: 'polyline', points: [G * 1.2, G * 2, G * 1.6, G * 1.8, G * 1.6, G * 2.2, G * 1.2, G * 2] }, // Internal diode arrow
        ],
        metadata: { category: 'power' }
    },

    // ── LM1117 3.3V LDO ──────────────────────
    {
        id: 'sym_lm1117',
        name: 'U',
        category: 'Power',
        description: '3.3V Low-Dropout Linear Regulator',
        width: G * 4,
        height: G * 3,
        showValue: true,
        pins: [
            { id: 'in', name: 'IN', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'gnd', name: 'GND', x: G * 2, y: G * 3, orientation: 'down', electricalType: 'power_in' },
            { id: 'out', name: 'OUT', x: G * 4, y: G, orientation: 'right', electricalType: 'power_out' },
        ],
        graphics: [
            { type: 'rect', x: G * 0.5, y: G * 0.5, width: G * 3, height: G * 2 },
            { type: 'text', x: G * 2, y: G * 1.6, text: 'LM1117-3.3', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'power', voltageDomain: '3.3V', requiresDecoupling: true }
    },

    // ── 4-Channel Bidirectional Level Shifter ──
    {
        id: 'sym_level_shifter',
        name: 'U',
        category: 'Communication',
        description: '4-Channel Bidirectional Logic Level Shifter',
        width: G * 6,
        height: G * 8,
        showValue: true,
        pins: [
            { id: 'lv', name: 'LV', x: 0, y: G, orientation: 'left', electricalType: 'power_in' },
            { id: 'lv1', name: 'LV1', x: 0, y: G * 3, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'lv2', name: 'LV2', x: 0, y: G * 4, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'lv3', name: 'LV3', x: 0, y: G * 5, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'lv4', name: 'LV4', x: 0, y: G * 6, orientation: 'left', electricalType: 'bidirectional' },
            { id: 'lgnd', name: 'GND', x: 0, y: G * 7, orientation: 'left', electricalType: 'power_in' },

            { id: 'hv', name: 'HV', x: G * 6, y: G, orientation: 'right', electricalType: 'power_in' },
            { id: 'hv1', name: 'HV1', x: G * 6, y: G * 3, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'hv2', name: 'HV2', x: G * 6, y: G * 4, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'hv3', name: 'HV3', x: G * 6, y: G * 5, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'hv4', name: 'HV4', x: G * 6, y: G * 6, orientation: 'right', electricalType: 'bidirectional' },
            { id: 'hgnd', name: 'GND', x: G * 6, y: G * 7, orientation: 'right', electricalType: 'power_in' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 4, height: G * 7 },
            { type: 'text', x: G * 3, y: G * 2, text: 'LVL SHIFT', fontSize: 10, align: 'center' },
        ],
        metadata: { category: 'mixed', voltageDomain: 'ADJUSTABLE' }
    },

    // ── SPDT Relay ────────────────────────────
    {
        id: 'sym_relay',
        name: 'K',
        category: 'Active',
        description: 'SPDT Relay',
        width: G * 4,
        height: G * 4,
        showValue: true,
        pins: [
            { id: 'c1', name: 'C1', x: 0, y: G, orientation: 'left', electricalType: 'passive' },
            { id: 'c2', name: 'C2', x: 0, y: G * 3, orientation: 'left', electricalType: 'passive' },
            { id: 'com', name: 'COM', x: G * 4, y: G, orientation: 'right', electricalType: 'passive' },
            { id: 'nc', name: 'NC', x: G * 4, y: G * 2, orientation: 'right', electricalType: 'passive' },
            { id: 'no', name: 'NO', x: G * 4, y: G * 3, orientation: 'right', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'rect', x: G, y: G * 0.5, width: G * 2, height: G * 3 },
            { type: 'line', x1: G * 1.5, y1: G, x2: G * 1.5, y2: G * 3, strokeWidth: 1.5 }, // coil
            { type: 'polyline', points: [G * 3, G, G * 3.5, G * 1.5, G * 3.5, G * 2.5, G * 3, G * 3] }, // switch armature
        ],
        metadata: { category: 'mixed' }
    },

    // ── 2-Pin Screw Terminal ──────────────────
    {
        id: 'sym_terminal_2',
        name: 'J',
        category: 'Passive',
        description: '2-Pin Screw Terminal Block',
        width: G * 2,
        height: G * 3,
        showValue: false,
        pins: [
            { id: 'p1', name: '1', x: G * 2, y: G, orientation: 'right', electricalType: 'passive' },
            { id: 'p2', name: '2', x: G * 2, y: G * 2, orientation: 'right', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'rect', x: 0, y: G * 0.5, width: G * 1.5, height: G * 2 },
            { type: 'circle', cx: G * 0.75, cy: G, r: G * 0.25 },
            { type: 'circle', cx: G * 0.75, cy: G * 2, r: G * 0.25 },
        ],
        metadata: { category: 'passive' }
    },

    // ── TVS Diode ─────────────────────────────
    {
        id: 'sym_tvs',
        name: 'D',
        category: 'Active',
        description: 'Transient Voltage Suppressor Diode',
        width: G * 2,
        height: G * 4,
        showValue: false,
        pins: [
            { id: 'a', name: 'A', x: G, y: 0, orientation: 'up', electricalType: 'passive' },
            { id: 'k', name: 'K', x: G, y: G * 4, orientation: 'down', electricalType: 'passive' },
        ],
        graphics: [
            { type: 'line', x1: G, y1: 0, x2: G, y2: G * 1.2 },
            { type: 'polyline', points: [G * 0.3, G * 1.2, G * 1.7, G * 1.2, G, G * 2.8, G * 0.3, G * 1.2], fill: 'none' },
            // Z-bar for TVS/Zener
            { type: 'polyline', points: [G * 0.1, G * 2.6, G * 0.3, G * 2.8, G * 1.7, G * 2.8, G * 1.9, G * 3.0], strokeWidth: 2 },
            { type: 'line', x1: G, y1: G * 2.8, x2: G, y2: G * 4 },
        ],
        metadata: { category: 'passive' }
    },
];

/** Lookup map for fast symbol retrieval by id */
export const symbolMap = new Map<string, SymbolDef>(
    builtInSymbols.map((s) => [s.id, s])
);

/** Get all unique categories */
export const getCategories = (): string[] => {
    return [...new Set(builtInSymbols.map((s) => s.category))];
};
