/* ──────────────────────────────────────────────
   Sheet Renderer — Draws hierarchical sheet instances on the canvas
   ────────────────────────────────────────────── */

import React from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import { SheetInstance, SheetDef, SheetPort } from '../../data/types';
import { useSchematicStore } from '../../store/schematicStore';

interface SheetRendererProps {
    sheetInstances: SheetInstance[];
    sheetDefs: SheetDef[];
}

export const SheetRenderer: React.FC<SheetRendererProps> = ({ sheetInstances, sheetDefs }) => {
    const selectedIds = useSchematicStore((s) => s.selectedIds);
    const hoveredId = useSchematicStore((s) => s.hoveredId);
    const selectSymbol = useSchematicStore((s) => s.selectSymbol);
    const setHoveredId = useSchematicStore((s) => s.setHoveredId);
    const openSheet = useSchematicStore((s) => s.openSheet);

    return (
        <>
            {sheetInstances.map((inst) => {
                const def = sheetDefs.find((sd) => sd.id === inst.sheetDefId);
                const isSelected = selectedIds.includes(inst.id);
                const isHovered = hoveredId === inst.id;
                const ports = def?.sheetPorts || [];

                return (
                    <Group
                        key={inst.id}
                        x={inst.x}
                        y={inst.y}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            selectSymbol(inst.id, e.evt.shiftKey);
                        }}
                        onDblClick={(e) => {
                            e.cancelBubble = true;
                            openSheet(inst.id);
                        }}
                        onMouseEnter={() => setHoveredId(inst.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        {/* Sheet body */}
                        <Rect
                            width={inst.width}
                            height={inst.height}
                            fill={isSelected ? 'rgba(68, 170, 255, 0.08)' : 'rgba(68, 170, 255, 0.03)'}
                            stroke={isSelected ? '#44aaff' : isHovered ? '#5588cc' : '#335577'}
                            strokeWidth={isSelected ? 2 : 1}
                            cornerRadius={3}
                            shadowBlur={isHovered ? 8 : 0}
                            shadowColor="#44aaff"
                        />

                        {/* Sheet title bar */}
                        <Rect
                            width={inst.width}
                            height={22}
                            fill="rgba(68, 170, 255, 0.12)"
                            cornerRadius={[3, 3, 0, 0]}
                        />
                        <Text
                            x={8}
                            y={4}
                            text={`📄 ${inst.name}`}
                            fontSize={11}
                            fontFamily="Inter, sans-serif"
                            fontStyle="bold"
                            fill="#44aaff"
                        />

                        {/* Filename */}
                        <Text
                            x={8}
                            y={inst.height - 16}
                            text={inst.filename}
                            fontSize={9}
                            fontFamily="JetBrains Mono, monospace"
                            fill="#557799"
                        />

                        {/* Sheet ports */}
                        {ports.map((port) => renderSheetPort(port, inst))}
                    </Group>
                );
            })}
        </>
    );
};

function renderSheetPort(port: SheetPort, inst: SheetInstance): React.ReactNode {
    let portX = 0;
    let portY = 0;
    let textAlign: 'left' | 'right' = 'left';
    let pinDx = 0;

    switch (port.side) {
        case 'left':
            portX = 0;
            portY = port.y;
            textAlign = 'left';
            pinDx = -8;
            break;
        case 'right':
            portX = inst.width;
            portY = port.y;
            textAlign = 'right';
            pinDx = 8;
            break;
        case 'top':
            portX = port.x;
            portY = 0;
            break;
        case 'bottom':
            portX = port.x;
            portY = inst.height;
            break;
    }

    const dirColor = port.direction === 'input' ? '#44dd88'
        : port.direction === 'output' ? '#ff6644'
            : port.direction === 'bidirectional' ? '#ffaa33'
                : '#88aacc';

    return (
        <Group key={port.id}>
            {/* Port pin stub */}
            <Line
                points={[portX + pinDx, portY, portX, portY]}
                stroke={dirColor}
                strokeWidth={2}
            />
            {/* Port dot */}
            <Rect
                x={portX - 3}
                y={portY - 3}
                width={6}
                height={6}
                fill={dirColor}
                cornerRadius={1}
            />
            {/* Port name */}
            <Text
                x={port.side === 'right' ? portX - 8 : portX + 8}
                y={portY - 5}
                text={port.name}
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                fill={dirColor}
                align={textAlign}
                width={80}
            />
        </Group>
    );
}
