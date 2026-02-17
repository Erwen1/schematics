/* ──────────────────────────────────────────────
   Layer Stack Engine — PCB Layer Definitions
   ────────────────────────────────────────────── */

import { PcbLayerDef } from '../data/types';

export const DEFAULT_LAYERS: PcbLayerDef[] = [
    { id: 'F.Cu', name: 'Front Copper', visible: true, color: '#843333' },
    { id: 'B.Cu', name: 'Back Copper', visible: true, color: '#333384' },
    { id: 'F.SilkS', name: 'Front Silk', visible: true, color: '#00eeee' },
    { id: 'B.SilkS', name: 'Back Silk', visible: true, color: '#00cccc' },
    { id: 'F.Mask', name: 'Front Mask', visible: false, color: '#843384' },
    { id: 'B.Mask', name: 'Back Mask', visible: false, color: '#338433' },
    { id: 'F.CrtYd', name: 'Front Courtyard', visible: true, color: '#888888' },
    { id: 'B.CrtYd', name: 'Back Courtyard', visible: true, color: '#666666' },
    { id: 'Edge.Cuts', name: 'Board Outline', visible: true, color: '#ffff00' },
];

export function getLayerColor(layerId: string): string {
    return DEFAULT_LAYERS.find(l => l.id === layerId)?.color ?? '#ffffff';
}

export function isRoutable(layerId: string): boolean {
    return layerId === 'F.Cu' || layerId === 'B.Cu';
}
