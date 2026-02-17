/* ──────────────────────────────────────────────
   TraceRenderer — Rendering PCB Traces and Vias
   ────────────────────────────────────────────── */

import React from 'react';
import { Line, Circle, Group } from 'react-konva';
import { PcbTrace, PcbVia } from '../../data/types';
import { getLayerColor } from '../../engine/layerStack';

interface Props {
    traces: PcbTrace[];
    vias: PcbVia[];
    previewPoints: { x: number, y: number }[] | null;
    activeLayer: string;
}

export const TraceRenderer: React.FC<Props> = ({ traces, vias, previewPoints, activeLayer }) => {
    return (
        <Group>
            {/* Routed Traces */}
            {traces.map(t => (
                <Line
                    key={t.id}
                    points={t.points.flatMap(p => [p.x, p.y])}
                    stroke={getLayerColor(t.layer)}
                    strokeWidth={t.width}
                    lineCap="round"
                    lineJoin="round"
                />
            ))}

            {/* Vias */}
            {vias.map(v => (
                <Group key={v.id} x={v.x} y={v.y}>
                    <Circle radius={v.size / 2} fill="#ffcc00" stroke="#886600" strokeWidth={0.1} />
                    <Circle radius={v.drill / 2} fill="#000000" />
                </Group>
            ))}

            {/* Routing Preview */}
            {previewPoints && (
                <Line
                    points={previewPoints.flatMap(p => [p.x, p.y])}
                    stroke={getLayerColor(activeLayer)}
                    strokeWidth={0.25}
                    opacity={0.6}
                    lineCap="round"
                    lineJoin="round"
                    dash={[0.5, 0.5]}
                />
            )}
        </Group>
    );
};
