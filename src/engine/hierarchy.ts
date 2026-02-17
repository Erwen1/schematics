/* ──────────────────────────────────────────────
   Hierarchy Engine — Cross-sheet net resolution
   ────────────────────────────────────────────── */

import {
    SheetDef,
    SheetInstance,
    SheetPort,
    Net,
    SymbolInstance,
    Wire,
    Junction,
    NetLabel,
    BusEntry,
} from '../data/types';
import { computeNets } from './connectivity';

/**
 * Resolve all nets across a hierarchical schematic design.
 *
 * Algorithm:
 * 1. Compute local nets for each sheet (using existing connectivity engine)
 * 2. For each sheet instance, match parent-side port connections to child sheet ports
 * 3. Merge nets across sheet boundaries when port names match
 * 4. Handle global net labels (scope === 'global') which connect across ALL sheets
 *
 * The result is a flat array of nets with sheetPath prefixes for traceability.
 */
export function resolveHierarchicalNets(
    rootSymbols: SymbolInstance[],
    rootWires: Wire[],
    rootJunctions: Junction[],
    rootNetLabels: NetLabel[],
    rootBusEntries: BusEntry[],
    rootSheetPorts: SheetPort[],
    sheetInstances: SheetInstance[],
    sheetDefs: SheetDef[],
    sheetPath: string = '/'
): Net[] {
    // ── Step 1: Compute local nets for this sheet ──
    const localNets = computeNets(rootSymbols, rootWires, rootJunctions, rootNetLabels);

    // Tag all local nets with the current sheet path
    for (const net of localNets) {
        net.sheetPath = sheetPath;
    }

    const allNets: Net[] = [...localNets];

    // ── Step 2: Process each sheet instance (child sheet) ──
    for (const sheetInst of sheetInstances) {
        const childDef = sheetDefs.find((sd) => sd.id === sheetInst.sheetDefId);
        if (!childDef) continue;

        const childPath = `${sheetPath}${sheetInst.name}/`;

        // Recursively resolve child nets
        const childNets = resolveHierarchicalNets(
            childDef.symbols,
            childDef.wires,
            childDef.junctions,
            childDef.netLabels,
            childDef.busEntries,
            childDef.sheetPorts,
            childDef.sheets,
            sheetDefs,
            childPath
        );

        // ── Step 3: Match parent ports to child ports ──
        // For each port on the child sheet, find the corresponding parent net
        // and merge them together.
        for (const childPort of childDef.sheetPorts) {
            // Find the parent net that connects to this sheet instance port
            // The port's position on the parent is calculated from the sheet instance position
            const portParentNet = findNetAtSheetPort(
                localNets,
                sheetInst,
                childPort,
                rootSymbols,
                rootWires
            );

            // Find the child net connected to this port inside the child sheet
            const portChildNet = findNetByPortInternal(
                childNets,
                childPort,
                childDef
            );

            // Merge: add child net's pin refs and wire IDs to the parent net
            if (portParentNet && portChildNet) {
                portParentNet.pinRefs.push(
                    ...portChildNet.pinRefs.map((pr) => ({
                        symbolId: `${sheetInst.id}::${pr.symbolId}`,
                        pinId: pr.pinId,
                    }))
                );
                portParentNet.wireIds.push(
                    ...portChildNet.wireIds.map((wid) => `${sheetInst.id}::${wid}`)
                );

                // Remove the merged child net from the list
                const idx = childNets.indexOf(portChildNet);
                if (idx !== -1) childNets.splice(idx, 1);
            }
        }

        // Add remaining (unmerged) child nets
        allNets.push(...childNets);
    }

    // ── Step 4: Global net label merging ──
    // Global labels connect across ALL sheets — merge nets sharing the same global label
    const globalLabelMap = new Map<string, Net[]>();
    for (const net of allNets) {
        if (net.name) {
            // Check if any global label matches this net name
            const isGlobal = rootNetLabels
                .concat(
                    ...sheetDefs.flatMap((sd) => sd.netLabels)
                )
                .some((nl) => nl.scope === 'global' && nl.name === net.name);

            if (isGlobal) {
                if (!globalLabelMap.has(net.name)) globalLabelMap.set(net.name, []);
                globalLabelMap.get(net.name)!.push(net);
            }
        }
    }

    // Merge all nets sharing the same global label into the first one
    for (const [, netsToMerge] of globalLabelMap) {
        if (netsToMerge.length <= 1) continue;
        const primary = netsToMerge[0];
        for (let i = 1; i < netsToMerge.length; i++) {
            const secondary = netsToMerge[i];
            primary.pinRefs.push(...secondary.pinRefs);
            primary.wireIds.push(...secondary.wireIds);
            // Remove secondary from allNets
            const idx = allNets.indexOf(secondary);
            if (idx !== -1) allNets.splice(idx, 1);
        }
    }

    return allNets;
}

/**
 * Find which local net connects to a sheet port on the parent side.
 * The parent-side connection point is calculated from the sheet instance position
 * plus the port's position on the sheet edge.
 */
function findNetAtSheetPort(
    parentNets: Net[],
    sheetInst: SheetInstance,
    port: SheetPort,
    _symbols: SymbolInstance[],
    _wires: Wire[]
): Net | undefined {
    // Calculate the port's absolute position on the parent canvas
    let portX = sheetInst.x;
    let portY = sheetInst.y;

    switch (port.side) {
        case 'left':
            portX = sheetInst.x;
            portY = sheetInst.y + port.y;
            break;
        case 'right':
            portX = sheetInst.x + sheetInst.width;
            portY = sheetInst.y + port.y;
            break;
        case 'top':
            portX = sheetInst.x + port.x;
            portY = sheetInst.y;
            break;
        case 'bottom':
            portX = sheetInst.x + port.x;
            portY = sheetInst.y + sheetInst.height;
            break;
    }

    // Look for a parent net whose name matches the port name
    // (port-based matching — the simplest reliable strategy)
    return parentNets.find((n) => n.name === port.name);
}

/**
 * Find the net inside a child sheet that connects to a given port.
 */
function findNetByPortInternal(
    childNets: Net[],
    port: SheetPort,
    _childDef: SheetDef
): Net | undefined {
    // A sheet port creates a named connection point — the net with the same name
    return childNets.find((n) => n.name === port.name);
}

/**
 * Get all sheet ports that are unconnected (not linked to any net).
 */
export function findUnconnectedPorts(
    sheetPorts: SheetPort[],
    nets: Net[],
    sheetPath: string
): SheetPort[] {
    return sheetPorts.filter((port) => {
        return !nets.some(
            (n) =>
                n.sheetPath === sheetPath &&
                n.name === port.name &&
                (n.pinRefs.length > 0 || n.wireIds.length > 0)
        );
    });
}
