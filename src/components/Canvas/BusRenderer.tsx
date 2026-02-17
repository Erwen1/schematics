/* ──────────────────────────────────────────────
   Bus Renderer — Draws bus wires and bus entries on the canvas
   ────────────────────────────────────────────── */

import React from 'react';
import { Group, Line, Text, RegularPolygon } from 'react-konva';
import { Wire, BusEntry, WirePoint } from '../../data/types';
import { useSchematicStore } from '../../store/schematicStore';
import { parseBusLabel } from '../../engine/bus';

interface BusRendererProps {
    busWires: Wire[];
    busEntries: BusEntry[];
    busWireInProgress: WirePoint[] | null;
    mousePos: { x: number; y: number } | null;
}

const BUS_COLOR = '#44aaff';
const BUS_WIDTH = 3;
const BUS_ENTRY_SIZE = 12;

export const BusRenderer: React.FC<BusRendererProps> = ({
    busWires,
    busEntries,
    busWireInProgress,
    mousePos,
}) => {
    const selectedIds = useSchematicStore((s) => s.selectedIds);
    const hoveredId = useSchematicStore((s) => s.hoveredId);
    const selectSymbol = useSchematicStore((s) => s.selectSymbol);
    const setHoveredId = useSchematicStore((s) => s.setHoveredId);

    return (
        <>
            {/* Bus wires */}
            {busWires.map((wire) => {
                const isSelected = selectedIds.includes(wire.id);
                const isHovered = hoveredId === wire.id;
                const flatPoints = wire.points.flatMap((p) => [p.x, p.y]);
                const parsed = wire.busLabel ? parseBusLabel(wire.busLabel) : null;

                return (
                    <Group key={wire.id}>
                        <Line
                            points={flatPoints}
                            stroke={isSelected ? '#66ccff' : isHovered ? '#5599dd' : BUS_COLOR}
                            strokeWidth={isSelected ? BUS_WIDTH + 1 : BUS_WIDTH}
                            lineCap="round"
                            lineJoin="round"
                            hitStrokeWidth={10}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                selectSymbol(wire.id, e.evt.shiftKey);
                            }}
                            onMouseEnter={() => setHoveredId(wire.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            shadowBlur={isHovered ? 6 : 0}
                            shadowColor={BUS_COLOR}
                        />
                        {/* Bus label at midpoint */}
                        {wire.busLabel && wire.points.length >= 2 && (
                            <Text
                                x={wire.points[0].x}
                                y={wire.points[0].y - 16}
                                text={wire.busLabel}
                                fontSize={10}
                                fontFamily="JetBrains Mono, monospace"
                                fontStyle="bold"
                                fill={BUS_COLOR}
                            />
                        )}
                        {/* Bus width indicator */}
                        {parsed && wire.points.length >= 2 && (
                            <Text
                                x={wire.points[0].x}
                                y={wire.points[0].y - 6}
                                text={`[${parsed.rangeEnd - parsed.rangeStart + 1}]`}
                                fontSize={8}
                                fontFamily="JetBrains Mono, monospace"
                                fill="#557799"
                            />
                        )}
                    </Group>
                );
            })}

            {/* Bus entries (fan-out diagonal) */}
            {busEntries.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);
                const isHovered = hoveredId === entry.id;
                const dx = entry.orientation === 'right' ? BUS_ENTRY_SIZE : -BUS_ENTRY_SIZE;
                const dy = BUS_ENTRY_SIZE;

                return (
                    <Group
                        key={entry.id}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            selectSymbol(entry.id, e.evt.shiftKey);
                        }}
                        onMouseEnter={() => setHoveredId(entry.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        {/* Diagonal line from bus to net */}
                        <Line
                            points={[entry.x, entry.y, entry.x + dx, entry.y + dy]}
                            stroke={isSelected ? '#66ccff' : isHovered ? '#5599dd' : BUS_COLOR}
                            strokeWidth={isSelected ? 2.5 : 2}
                            lineCap="round"
                        />
                        {/* Small dot at connection point */}
                        <RegularPolygon
                            x={entry.x + dx}
                            y={entry.y + dy}
                            sides={4}
                            radius={3}
                            fill={BUS_COLOR}
                            rotation={45}
                        />
                        {/* Member net name */}
                        <Text
                            x={entry.x + dx + (entry.orientation === 'right' ? 6 : -40)}
                            y={entry.y + dy - 4}
                            text={`${entry.busNetName}${entry.memberIndex}`}
                            fontSize={9}
                            fontFamily="JetBrains Mono, monospace"
                            fill="#88bbdd"
                        />
                    </Group>
                );
            })}

            {/* Bus wire in progress (ghost) */}
            {busWireInProgress && busWireInProgress.length > 0 && (
                <>
                    {busWireInProgress.length >= 2 && (
                        <Line
                            points={busWireInProgress.flatMap((p) => [p.x, p.y])}
                            stroke={BUS_COLOR}
                            strokeWidth={BUS_WIDTH}
                            lineCap="round"
                            lineJoin="round"
                            opacity={0.7}
                            dash={[8, 4]}
                        />
                    )}
                    {mousePos && (
                        <Line
                            points={[
                                busWireInProgress[busWireInProgress.length - 1].x,
                                busWireInProgress[busWireInProgress.length - 1].y,
                                mousePos.x,
                                busWireInProgress[busWireInProgress.length - 1].y,
                                mousePos.x,
                                mousePos.y,
                            ]}
                            stroke={BUS_COLOR}
                            strokeWidth={BUS_WIDTH}
                            lineCap="round"
                            lineJoin="round"
                            opacity={0.4}
                            dash={[6, 4]}
                        />
                    )}
                </>
            )}
        </>
    );
};
