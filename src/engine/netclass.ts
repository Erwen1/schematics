/* ──────────────────────────────────────────────
   Net Class Engine — Net classification and constraint management
   ────────────────────────────────────────────── */

import { Net, NetClass } from '../data/types';

/**
 * Default net classes provided out-of-the-box.
 */
export const DEFAULT_NET_CLASSES: NetClass[] = [
    {
        id: 'nc_default',
        name: 'Default',
        description: 'Standard signal nets',
        color: '#44dd88',
        constraints: {
            clearance: 8,
            traceWidth: 10,
            viaSize: 24,
            viaDrill: 12,
        },
        patterns: [],
    },
    {
        id: 'nc_power',
        name: 'Power',
        description: 'Power supply rails (VCC, GND, +5V, etc.)',
        color: '#ff6644',
        constraints: {
            clearance: 10,
            traceWidth: 20,
            viaSize: 32,
            viaDrill: 16,
        },
        patterns: ['VCC', 'GND', 'VDD', 'VSS', '+*V', '-*V', '3V3', '5V', '12V'],
    },
    {
        id: 'nc_highspeed',
        name: 'HighSpeed',
        description: 'High-speed signals requiring controlled impedance',
        color: '#aa44ff',
        constraints: {
            clearance: 6,
            traceWidth: 8,
            viaSize: 20,
            viaDrill: 10,
        },
        patterns: ['CLK*', 'SCK*', 'MISO*', 'MOSI*', 'SDA*', 'SCL*', 'TX*', 'RX*', 'USB*'],
    },
];

/**
 * Check if a net name matches a pattern.
 * Supports simple wildcard: '*' matches any characters.
 */
function matchesPattern(netName: string, pattern: string): boolean {
    if (pattern === netName) return true;

    // Convert glob pattern to regex
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('^' + escaped.replace(/\*/g, '.*') + '$', 'i');
    return regex.test(netName);
}

/**
 * Auto-assign a net class to a net based on its name.
 * Priority: most specific match (Power patterns → Power, etc.)
 * Falls back to "Default" if no pattern matches.
 */
export function assignNetClass(
    net: Net,
    netClasses: NetClass[]
): string {
    if (!net.name) return 'nc_default';

    // Check each class's patterns (skip Default — it's the fallback)
    for (const nc of netClasses) {
        if (nc.id === 'nc_default') continue;
        for (const pattern of nc.patterns) {
            if (matchesPattern(net.name, pattern)) {
                return nc.id;
            }
        }
    }

    return 'nc_default';
}

/**
 * Auto-assign net classes to all nets.
 * Returns a new array with netClassId populated.
 */
export function autoAssignNetClasses(
    nets: Net[],
    netClasses: NetClass[]
): Net[] {
    return nets.map((net) => ({
        ...net,
        netClassId: net.netClassId || assignNetClass(net, netClasses),
    }));
}

/**
 * Get the constraints for a given net class.
 */
export function getNetConstraints(
    netClassId: string,
    netClasses: NetClass[]
): NetClass['constraints'] {
    const nc = netClasses.find((c) => c.id === netClassId);
    return nc?.constraints ?? DEFAULT_NET_CLASSES[0].constraints;
}

/**
 * Get the display color for a net class.
 */
export function getNetClassColor(
    netClassId: string,
    netClasses: NetClass[]
): string {
    const nc = netClasses.find((c) => c.id === netClassId);
    return nc?.color ?? '#44dd88';
}

/**
 * Validate a net class name is unique.
 */
export function isNetClassNameUnique(
    name: string,
    netClasses: NetClass[],
    excludeId?: string
): boolean {
    return !netClasses.some((nc) => nc.name === name && nc.id !== excludeId);
}
