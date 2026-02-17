/* ──────────────────────────────────────────────
   Footprint Library — PCB Footprint Definitions
   ────────────────────────────────────────────── */

import { FootprintDef } from './types';

export const builtInFootprints: FootprintDef[] = [
    // ── 0805 Resistor/Capacitor/LED ───────────
    {
        id: 'fp_0805',
        name: 'R0805',
        symbolRef: 'sym_resistor',
        pads: [
            { id: '1', shape: 'rect', x: -0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
            { id: '2', shape: 'rect', x: 0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.0, y: -0.65, width: 2.0, height: 1.3 }, // Silkscreen
        ],
        courtyard: { x: -1.6, y: -0.9, width: 3.2, height: 1.8 }
    },
    {
        id: 'fp_0805_cap',
        name: 'C0805',
        symbolRef: 'sym_capacitor',
        pads: [
            { id: '1', shape: 'rect', x: -0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
            { id: '2', shape: 'rect', x: 0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.0, y: -0.65, width: 2.0, height: 1.3 },
        ],
        courtyard: { x: -1.6, y: -0.9, width: 3.2, height: 1.8 }
    },
    {
        id: 'fp_0805_led',
        name: 'LED0805',
        symbolRef: 'sym_led',
        pads: [
            { id: 'a', shape: 'rect', x: -0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
            { id: 'k', shape: 'rect', x: 0.9, y: 0, width: 1.0, height: 1.3, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.0, y: -0.65, width: 2.0, height: 1.3 },
            { type: 'line', x1: 0.3, y1: -0.4, x2: 0.3, y2: 0.4 }, // Cathode bar
        ],
        courtyard: { x: -1.6, y: -0.9, width: 3.2, height: 1.8 }
    },

    // ── SOD-123 Diode ─────────────────────────
    {
        id: 'fp_sod123',
        name: 'SOD-123',
        symbolRef: 'sym_diode',
        pads: [
            { id: 'a', shape: 'rect', x: -1.65, y: 0, width: 0.9, height: 1.2, layer: 'F.Cu' },
            { id: 'k', shape: 'rect', x: 1.65, y: 0, width: 0.9, height: 1.2, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.4, y: -0.8, width: 2.8, height: 1.6 },
            { type: 'line', x1: 0.8, y1: -0.8, x2: 0.8, y2: 0.8 },
        ],
        courtyard: { x: -2.3, y: -1.1, width: 4.6, height: 2.2 }
    },

    // ── SOT-23 Transistor ─────────────────────
    {
        id: 'fp_sot23',
        name: 'SOT-23',
        symbolRef: 'sym_npn',
        pads: [
            { id: 'b', shape: 'rect', x: -0.95, y: -0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
            { id: 'e', shape: 'rect', x: 0.95, y: -0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
            { id: 'c', shape: 'rect', x: 0, y: 0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.45, y: -0.65, width: 2.9, height: 1.3 },
        ],
        courtyard: { x: -1.8, y: -1.6, width: 3.6, height: 3.2 }
    },

    // ── SOIC-8 Op-Amp ──────────────────────────
    {
        id: 'fp_soic8',
        name: 'SOIC-8',
        symbolRef: 'sym_opamp',
        pads: [
            { id: '1', shape: 'rect', x: -2.6, y: -1.905, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '2', shape: 'rect', x: -2.6, y: -0.635, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '3', shape: 'rect', x: -2.6, y: 0.635, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '4', shape: 'rect', x: -2.6, y: 1.905, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '5', shape: 'rect', x: 2.6, y: 1.905, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '6', shape: 'rect', x: 2.6, y: 0.635, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '7', shape: 'rect', x: 2.6, y: -0.635, width: 1.5, height: 0.6, layer: 'F.Cu' },
            { id: '8', shape: 'rect', x: 2.6, y: -1.905, width: 1.5, height: 0.6, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.95, y: -2.45, width: 3.9, height: 4.9 },
            { type: 'circle', cx: -1.5, cy: -2.0, r: 0.3 }, // Pin 1 mark
        ],
        courtyard: { x: -3.7, y: -2.7, width: 7.4, height: 5.4 }
    },

    // ── 1210 Inductor ─────────────────────────
    {
        id: 'fp_1210',
        name: 'L1210',
        symbolRef: 'sym_inductor',
        pads: [
            { id: '1', shape: 'rect', x: -1.4, y: 0, width: 1.2, height: 2.5, layer: 'F.Cu' },
            { id: '2', shape: 'rect', x: 1.4, y: 0, width: 1.2, height: 2.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.6, y: -1.25, width: 3.2, height: 2.5 },
        ],
        courtyard: { x: -2.3, y: -1.6, width: 4.6, height: 3.2 }
    },

    // ── ESP32-WROOM-32 ───────────────────────
    {
        id: 'fp_esp32_wroom',
        name: 'ESP32-WROOM-32',
        symbolRef: 'sym_esp32',
        pads: [
            { id: '3v3', shape: 'rect', x: -9, y: -8, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'en', shape: 'rect', x: -9, y: -6.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio34', shape: 'rect', x: -9, y: -5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio35', shape: 'rect', x: -9, y: -3.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio32', shape: 'rect', x: -9, y: -2, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio33', shape: 'rect', x: -9, y: -0.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio25', shape: 'rect', x: -9, y: 1, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio26', shape: 'rect', x: -9, y: 2.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio27', shape: 'rect', x: -9, y: 4, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio14', shape: 'rect', x: -9, y: 5.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio12', shape: 'rect', x: -9, y: 7, width: 2, height: 0.9, layer: 'F.Cu' },

            { id: 'gnd', shape: 'rect', x: 0, y: 9, width: 2, height: 2, layer: 'F.Cu' },

            { id: 'gpio21', shape: 'rect', x: 9, y: -8, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio22', shape: 'rect', x: 9, y: -6.5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'gpio19', shape: 'rect', x: 9, y: -5, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'tx0', shape: 'rect', x: 9, y: 1, width: 2, height: 0.9, layer: 'F.Cu' },
            { id: 'rx0', shape: 'rect', x: 9, y: 2.5, width: 2, height: 0.9, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -9, y: -12, width: 18, height: 24 },
        ],
        courtyard: { x: -10, y: -13, width: 20, height: 26 }
    },

    // ── BME280 Module ─────────────────────────
    {
        id: 'fp_bme280',
        name: 'BME280-Module',
        symbolRef: 'sym_bme280',
        pads: [
            { id: 'vcc', shape: 'rect', x: -5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: -5, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'scl', shape: 'rect', x: -5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'sda', shape: 'rect', x: -5, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'csb', shape: 'rect', x: -5, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'sdo', shape: 'rect', x: -5, y: 6, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -6, y: -6, width: 12, height: 14 },
        ],
        courtyard: { x: -7, y: -7, width: 14, height: 16 }
    },

    // ── OLED 0.96 Header ──────────────────────
    {
        id: 'fp_oled_header',
        name: 'OLED-I2C-Header',
        symbolRef: 'sym_oled',
        pads: [
            { id: 'gnd', shape: 'rect', x: -3.81, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'vcc', shape: 'rect', x: -1.27, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'scl', shape: 'rect', x: 1.27, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'sda', shape: 'rect', x: 3.81, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -5, y: -1, width: 10, height: 2 },
        ],
        courtyard: { x: -6, y: -2, width: 12, height: 4 }
    },

    // ── TO-220 (Regulator) ───────────────────
    {
        id: 'fp_to220',
        name: 'TO-220',
        symbolRef: 'sym_7805',
        pads: [
            { id: 'in', shape: 'rect', x: -2.54, y: 0, width: 1.5, height: 2, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: 0, y: 0, width: 1.5, height: 2, layer: 'F.Cu' },
            { id: 'out', shape: 'rect', x: 2.54, y: 0, width: 1.5, height: 2, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -5, y: -2, width: 10, height: 4 },
        ],
        courtyard: { x: -6, y: -3, width: 12, height: 6 }
    },

    // ── Battery Connector ────────────────────
    {
        id: 'fp_batt_conn',
        name: 'BATT-PH2.0',
        symbolRef: 'sym_battery',
        pads: [
            { id: 'p1', shape: 'rect', x: -1, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'p2', shape: 'rect', x: 1, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -2, y: -1, width: 4, height: 2 },
        ],
        courtyard: { x: -3, y: -2, width: 6, height: 4 }
    },

    // ── TP4056 Module ─────────────────────────
    {
        id: 'fp_tp4056',
        name: 'TP4056-Module',
        symbolRef: 'sym_tp4056',
        pads: [
            { id: 'vcc', shape: 'rect', x: -8, y: -8, width: 2, height: 2, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: -8, y: 8, width: 2, height: 2, layer: 'F.Cu' },
            { id: 'prog', shape: 'rect', x: 0, y: 0, width: 1, height: 1, layer: 'F.Cu' },
            { id: 'bat', shape: 'rect', x: 8, y: -4, width: 2, height: 2, layer: 'F.Cu' },
            { id: 'ce', shape: 'rect', x: 8, y: 4, width: 2, height: 2, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -10, y: -10, width: 20, height: 20 },
        ],
        courtyard: { x: -11, y: -11, width: 22, height: 22 }
    },

    // ── MP1584 Buck Footprint ────────────────
    {
        id: 'fp_mp1584',
        name: 'MP1584-Module',
        symbolRef: 'sym_mp1584',
        pads: [
            { id: 'vin', shape: 'rect', x: -5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'en', shape: 'rect', x: -5, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'freq', shape: 'rect', x: -5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'comp', shape: 'rect', x: -5, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: 0, y: 7, width: 2, height: 2, layer: 'F.Cu' },
            { id: 'sw', shape: 'rect', x: 5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'fb', shape: 'rect', x: 5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'bst', shape: 'rect', x: 5, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -6, y: -6, width: 12, height: 14 },
        ],
        courtyard: { x: -7, y: -7, width: 14, height: 16 }
    },

    // ── LAN8720 Footprint ────────────────────
    {
        id: 'fp_lan8720',
        name: 'LAN8720-Module',
        symbolRef: 'sym_lan8720',
        pads: [
            { id: 'vddio', shape: 'rect', x: -10, y: -12, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'reset', shape: 'rect', x: -10, y: -10, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'tx0', shape: 'rect', x: -10, y: -6, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'tx1', shape: 'rect', x: -10, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'txen', shape: 'rect', x: -10, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'rx0', shape: 'rect', x: -10, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'rx1', shape: 'rect', x: -10, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'crs_dv', shape: 'rect', x: -10, y: 6, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'mdc', shape: 'rect', x: -10, y: 10, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'mdio', shape: 'rect', x: -10, y: 12, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: 0, y: 15, width: 3, height: 3, layer: 'F.Cu' },
            { id: 'txp', shape: 'rect', x: 10, y: -10, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'txn', shape: 'rect', x: 10, y: -8, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'rxp', shape: 'rect', x: 10, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'rxn', shape: 'rect', x: 10, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'refclk', shape: 'rect', x: 10, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'rbias', shape: 'rect', x: 10, y: 6, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'led1', shape: 'rect', x: 10, y: 10, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'led2', shape: 'rect', x: 10, y: 12, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -11, y: -14, width: 22, height: 28 },
        ],
        courtyard: { x: -12, y: -15, width: 24, height: 30 }
    },

    // ── MAX485 Footprint ─────────────────────
    {
        id: 'fp_max485',
        name: 'MAX485-Module',
        symbolRef: 'sym_max485',
        pads: [
            { id: 'ro', shape: 'rect', x: -4, y: -3, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 're', shape: 'rect', x: -4, y: -1, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'de', shape: 'rect', x: -4, y: 1, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'di', shape: 'rect', x: -4, y: 3, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: 0, y: 5, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'vcc', shape: 'rect', x: 0, y: -5, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'a', shape: 'rect', x: 4, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'b', shape: 'rect', x: 4, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -5, y: -6, width: 10, height: 12 },
        ],
        courtyard: { x: -6, y: -7, width: 12, height: 14 }
    },

    // ── ADS1115 Footprint ────────────────────
    {
        id: 'fp_ads1115',
        name: 'ADS1115-Module',
        symbolRef: 'sym_ads1115',
        pads: [
            { id: 'vcc', shape: 'rect', x: -5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: -5, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'scl', shape: 'rect', x: -5, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'sda', shape: 'rect', x: -5, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'addr', shape: 'rect', x: -5, y: 6, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'a0', shape: 'rect', x: 5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'a1', shape: 'rect', x: 5, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'a2', shape: 'rect', x: 5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'a3', shape: 'rect', x: 5, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'alert', shape: 'rect', x: 5, y: 6, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -6, y: -7, width: 12, height: 14 },
        ],
        courtyard: { x: -7, y: -8, width: 14, height: 16 }
    },

    // ── MicroSD Footprint ───────────────────
    {
        id: 'fp_microsd',
        name: 'MicroSD-Storage',
        symbolRef: 'sym_microsd',
        pads: [
            { id: 'cs', shape: 'rect', x: -5, y: -4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'mosi', shape: 'rect', x: -5, y: -2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'vcc', shape: 'rect', x: -5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'sck', shape: 'rect', x: -5, y: 2, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'gnd', shape: 'rect', x: -5, y: 4, width: 1.5, height: 1.5, layer: 'F.Cu' },
            { id: 'miso', shape: 'rect', x: 5, y: 0, width: 1.5, height: 1.5, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -6, y: -6, width: 12, height: 12 },
        ],
        courtyard: { x: -7, y: -7, width: 14, height: 14 }
    },

    // ── SOT-23-3 MOSFET ──────────────────────
    {
        id: 'fp_sot23_mosfet',
        name: 'SOT-23-MOSFET',
        symbolRef: 'sym_mosfet_n',
        pads: [
            { id: 'g', shape: 'rect', x: -0.95, y: -0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
            { id: 's', shape: 'rect', x: 0.95, y: -0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
            { id: 'd', shape: 'rect', x: 0, y: 0.95, width: 0.6, height: 0.7, layer: 'F.Cu' },
        ],
        graphics: [
            { type: 'rect', x: -1.45, y: -0.65, width: 2.9, height: 1.3 },
        ],
        courtyard: { x: -1.8, y: -1.6, width: 3.6, height: 3.2 }
    },
];

export const footprintMap = new Map<string, FootprintDef>(
    builtInFootprints.map(fp => [fp.id, fp])
);

/** Find footprint for a given symbol definition id */
export const getFootprintForSymbol = (symbolId: string): FootprintDef | undefined => {
    return builtInFootprints.find(fp => fp.symbolRef === symbolId);
};
