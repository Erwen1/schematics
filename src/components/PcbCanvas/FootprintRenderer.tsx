/* ──────────────────────────────────────────────
   FootprintRenderer — Rendering PCB Footprints
   ────────────────────────────────────────────── */

import React from 'react';
import { Group, Rect, Circle, Text, Line } from 'react-konva';
import { FootprintInstance, FootprintDef, PadDef, GraphicPrimitive } from '../../data/types';
import { footprintMap } from '../../data/footprintLibrary';
import { getLayerColor } from '../../engine/layerStack';

interface Props {
    instance: FootprintInstance;
    selected: boolean;
    onSelect?: () => void;
}

const PadRenderer = ({ pad, flipped }: { pad: PadDef, flipped: boolean }) => {
    const color = getLayerColor(pad.layer);
    const commonProps = {
        x: pad.x,
        y: pad.y,
        fill: color,
        stroke: '#ffffff',
        strokeWidth: 0.1,
    };

    if (pad.shape === 'rect' || pad.shape === 'roundrect') {
        return (
            <Rect
                {...commonProps}
                width={pad.width}
                height={pad.height}
                offsetX={pad.width / 2}
                offsetY={pad.height / 2}
                cornerRadius={pad.shape === 'roundrect' ? 0.2 : 0}
            />
        );
    } else {
        return (
            <Circle
                {...commonProps}
                radius={pad.width / 2}
            />
        );
    }
};

const GraphicRenderer = ({ graphic, color }: { graphic: GraphicPrimitive, color: string }) => {
    if (graphic.type === 'rect') {
        return <Rect x={graphic.x} y={graphic.y} width={graphic.width} height={graphic.height} stroke={color} strokeWidth={0.1} />;
    } else if (graphic.type === 'line') {
        return <Line points={[graphic.x1, graphic.y1, graphic.x2, graphic.y2]} stroke={color} strokeWidth={0.1} />;
    }
    return null;
};

export const FootprintRenderer: React.FC<Props> = ({ instance, selected, onSelect }) => {
    const fpDef = footprintMap.get(instance.footprintRef);
    if (!fpDef) return null;

    const silkColor = getLayerColor(instance.flipped ? 'B.SilkS' : 'F.SilkS');
    const crtydColor = getLayerColor(instance.flipped ? 'B.CrtYd' : 'F.CrtYd');

    return (
        <Group
            x={instance.x}
            y={instance.y}
            rotation={instance.rotation}
            onClick={onSelect}
        >
            {/* Courtyard */}
            <Rect
                x={fpDef.courtyard.x}
                y={fpDef.courtyard.y}
                width={fpDef.courtyard.width}
                height={fpDef.courtyard.height}
                stroke={crtydColor}
                strokeWidth={0.05}
                dash={[0.5, 0.5]}
            />

            {/* Silkscreen Graphics */}
            {fpDef.graphics.map((g, i) => (
                <GraphicRenderer key={i} graphic={g} color={silkColor} />
            ))}

            {/* Pads */}
            {fpDef.pads.map((p, i) => (
                <PadRenderer key={i} pad={p} flipped={instance.flipped} />
            ))}

            {/* Reference Designator */}
            <Text
                text={instance.componentRef}
                fontSize={1.2}
                fill={silkColor}
                x={fpDef.courtyard.x}
                y={fpDef.courtyard.y - 1.5}
                align="center"
            />

            {/* Selection Highlight */}
            {selected && (
                <Rect
                    x={fpDef.courtyard.x - 0.2}
                    y={fpDef.courtyard.y - 0.2}
                    width={fpDef.courtyard.width + 0.4}
                    height={fpDef.courtyard.height + 0.4}
                    stroke="#00ffff"
                    strokeWidth={0.2}
                />
            )}
        </Group>
    );
};
