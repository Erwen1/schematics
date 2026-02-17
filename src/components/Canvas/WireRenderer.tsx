/* ──────────────────────────────────────────────
   WireRenderer — Renders wires, junctions, net labels,
   ghost preview, and vertex handles
   ────────────────────────────────────────────── */

import React from 'react';
import { Line, Circle, Text, Group, Rect } from 'react-konva';
import { Wire, WirePoint, Junction, NetLabel } from '../../data/types';
import { useSchematicStore } from '../../store/schematicStore';

interface WireGroupProps {
    wires: Wire[];
    junctions: Junction[];
    netLabels: NetLabel[];
    wireInProgress: WirePoint[] | null;
    darkMode: boolean;
}

const JUNCTION_RADIUS = 4;

const WireGroup: React.FC<WireGroupProps> = ({
    wires,
    junctions,
    netLabels,
    wireInProgress,
    darkMode,
}) => {
    const selectedIds = useSchematicStore((s) => s.selectedIds);
    const hoveredId = useSchematicStore((s) => s.hoveredId);
    const mousePos = useSchematicStore((s) => s.mousePos);
    const wireColor = darkMode ? '#44dd88' : '#008844';
    const selectedWireColor = '#00d4ff';
    const hoveredWireColor = darkMode ? '#66ffaa' : '#00aa55';
    const wipColor = darkMode ? '#88aaff' : '#4466cc';
    const junctionColor = darkMode ? '#ffcc44' : '#cc8800';
    const netLabelColor = darkMode ? '#ff88dd' : '#cc2288';
    const netLabelBg = darkMode ? 'rgba(255,136,221,0.12)' : 'rgba(204,34,136,0.08)';

    return (
        <>
            {/* Placed wires */}
            {wires.map((wire) => {
                const flatPoints = wire.points.flatMap((p) => [p.x, p.y]);
                const isSelected = selectedIds.includes(wire.id);
                const isHovered = hoveredId === wire.id;
                let color = wireColor;
                if (isSelected) color = selectedWireColor;
                else if (isHovered) color = hoveredWireColor;

                return (
                    <React.Fragment key={wire.id}>
                        <Line
                            points={flatPoints}
                            stroke={color}
                            strokeWidth={isSelected ? 2.5 : isHovered ? 2.2 : 2}
                            lineCap="round"
                            lineJoin="round"
                            hitStrokeWidth={12}
                            onClick={(e) => {
                                e.cancelBubble = true;
                                useSchematicStore.getState().selectSymbol(wire.id, e.evt.shiftKey);
                            }}
                            onMouseEnter={() => {
                                useSchematicStore.getState().setHoveredId(wire.id);
                            }}
                            onMouseLeave={() => {
                                useSchematicStore.getState().setHoveredId(null);
                            }}
                        />
                        {/* Vertex handles for selected wires */}
                        {isSelected &&
                            wire.points.map((p, idx) => (
                                <Circle
                                    key={`vertex_${wire.id}_${idx}`}
                                    x={p.x}
                                    y={p.y}
                                    radius={4}
                                    fill={selectedWireColor}
                                    stroke="#fff"
                                    strokeWidth={1}
                                    draggable
                                    onDragStart={(e) => {
                                        e.cancelBubble = true;
                                        useSchematicStore.getState().saveSnapshot();
                                    }}
                                    onDragEnd={(e) => {
                                        e.cancelBubble = true;
                                        useSchematicStore.getState().moveWireVertex(
                                            wire.id,
                                            idx,
                                            e.target.x(),
                                            e.target.y()
                                        );
                                        useSchematicStore.getState().autoSave();
                                    }}
                                />
                            ))}
                    </React.Fragment>
                );
            })}

            {/* Junction dots — explicit connection points */}
            {junctions.map((j) => (
                <Circle
                    key={`junc_${j.id}`}
                    x={j.x}
                    y={j.y}
                    radius={JUNCTION_RADIUS}
                    fill={junctionColor}
                    stroke={darkMode ? '#88660022' : '#66440022'}
                    strokeWidth={1}
                    hitStrokeWidth={10}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        useSchematicStore.getState().selectSymbol(j.id, e.evt.shiftKey);
                    }}
                />
            ))}

            {/* Net labels */}
            {netLabels.map((label) => (
                <Group
                    key={`netlabel_${label.id}`}
                    x={label.x}
                    y={label.y - 18}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        useSchematicStore.getState().selectSymbol(label.id, e.evt.shiftKey);
                    }}
                >
                    <Rect
                        x={-2}
                        y={-2}
                        width={label.name.length * 8 + 12}
                        height={18}
                        fill={netLabelBg}
                        stroke={netLabelColor}
                        strokeWidth={selectedIds.includes(label.id) ? 2 : 1}
                        cornerRadius={3}
                    />
                    <Text
                        x={4}
                        y={1}
                        text={label.name}
                        fontSize={11}
                        fontFamily="JetBrains Mono, monospace"
                        fontStyle="bold"
                        fill={netLabelColor}
                    />
                </Group>
            ))}

            {/* Wire in progress + ghost segment */}
            {wireInProgress && wireInProgress.length > 0 && (
                <>
                    {/* Committed segments */}
                    <Line
                        points={wireInProgress.flatMap((p) => [p.x, p.y])}
                        stroke={wipColor}
                        strokeWidth={2}
                        dash={[6, 4]}
                        lineCap="round"
                        lineJoin="round"
                    />
                    {wireInProgress.map((p, i) => (
                        <Circle
                            key={`wip_${i}`}
                            x={p.x}
                            y={p.y}
                            radius={3}
                            fill={wipColor}
                        />
                    ))}

                    {/* Ghost segment from last point to cursor */}
                    {mousePos && (() => {
                        const last = wireInProgress[wireInProgress.length - 1];
                        // Orthogonal routing: horizontal first, then vertical
                        const ghostPoints =
                            last.x !== mousePos.x && last.y !== mousePos.y
                                ? [last.x, last.y, mousePos.x, last.y, mousePos.x, mousePos.y]
                                : [last.x, last.y, mousePos.x, mousePos.y];
                        return (
                            <>
                                <Line
                                    points={ghostPoints}
                                    stroke={wipColor}
                                    strokeWidth={1.5}
                                    dash={[4, 6]}
                                    opacity={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                                <Circle
                                    x={mousePos.x}
                                    y={mousePos.y}
                                    radius={3}
                                    fill={wipColor}
                                    opacity={0.5}
                                />
                            </>
                        );
                    })()}
                </>
            )}
        </>
    );
};

export default React.memo(WireGroup);
