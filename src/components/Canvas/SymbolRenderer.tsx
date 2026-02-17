/* ──────────────────────────────────────────────
   SymbolRenderer — Renders placed symbol instances
   with hover highlighting, pin glow, and selection
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import { Group, Line, Circle, Arc, Text, Rect } from 'react-konva';
import { SymbolInstance, GraphicPrimitive } from '../../data/types';
import { symbolMap } from '../../data/symbolLibrary';
import { useSchematicStore } from '../../store/schematicStore';

interface SymbolRendererProps {
    symbol: SymbolInstance;
    isSelected: boolean;
    darkMode: boolean;
}

const PIN_RADIUS = 3;
const PIN_LEAD_LEN = 20;

const CAD_COLORS = {
    body: '#840000',      // KiCad Red/Brown component outline
    pin: '#840000',       // KiCad Red/Brown pin line
    pinName: '#008484',   // KiCad Cyan pin labels
    pinNumber: '#840001', // KiCad Red pin numbers
    ref: '#008484',       // KiCad Cyan reference
    val: '#008484',       // KiCad Cyan value
    background: '#ffffff',
};

function renderGraphic(
    g: GraphicPrimitive,
    idx: number,
    strokeColor: string
) {
    switch (g.type) {
        case 'line':
            return (
                <Line
                    key={idx}
                    points={[g.x1, g.y1, g.x2, g.y2]}
                    stroke={CAD_COLORS.body}
                    strokeWidth={1.2}
                    lineCap="round"
                />
            );
        case 'polyline':
            return (
                <Line
                    key={idx}
                    points={g.points}
                    stroke={CAD_COLORS.body}
                    strokeWidth={1.2}
                    lineCap="round"
                    lineJoin="round"
                    closed={false}
                />
            );
        case 'rect':
            return (
                <Rect
                    key={idx}
                    x={g.x}
                    y={g.y}
                    width={g.width}
                    height={g.height}
                    stroke={CAD_COLORS.body}
                    fill={g.fill || 'transparent'}
                    strokeWidth={1.5}
                />
            );
        case 'circle':
            return (
                <Circle
                    key={idx}
                    x={g.cx}
                    y={g.cy}
                    radius={g.r}
                    stroke={CAD_COLORS.body}
                    strokeWidth={1}
                    fill="transparent"
                />
            );
        case 'arc':
            return (
                <Arc
                    key={idx}
                    x={g.cx}
                    y={g.cy}
                    innerRadius={g.r}
                    outerRadius={g.r}
                    angle={g.endAngle - g.startAngle}
                    rotation={g.startAngle}
                    stroke={CAD_COLORS.body}
                    strokeWidth={1.2}
                />
            );
        case 'text':
            return (
                <Text
                    key={idx}
                    x={g.x}
                    y={g.y}
                    text={g.text}
                    fontSize={g.fontSize || 10}
                    fontFamily="Inter, sans-serif"
                    fill={CAD_COLORS.body}
                    align={g.align || 'left'}
                />
            );
        default:
            return null;
    }
}

const SymbolRenderer: React.FC<SymbolRendererProps> = ({
    symbol,
    isSelected,
    darkMode,
}) => {
    const def = symbolMap.get(symbol.symbolRef);
    const moveSymbol = useSchematicStore((s) => s.moveSymbol);
    const selectSymbol = useSchematicStore((s) => s.selectSymbol);
    const saveSnapshot = useSchematicStore((s) => s.saveSnapshot);
    const autoSave = useSchematicStore((s) => s.autoSave);
    const tool = useSchematicStore((s) => s.tool);
    const setHoveredId = useSchematicStore((s) => s.setHoveredId);
    const hoveredId = useSchematicStore((s) => s.hoveredId);

    const [hoveredPin, setHoveredPin] = useState<string | null>(null);

    if (!def) return null;

    const isHovered = hoveredId === symbol.id;

    // KiCad uses consistent colors regardless of dark mode for schematic fidelity,
    // but we can subtlely adjust the background if needed.
    const bodyColor = CAD_COLORS.body;
    const hoverGlow = isHovered && !isSelected ? (darkMode ? 'rgba(0,212,255,0.1)' : 'rgba(0,100,180,0.05)') : 'transparent';

    const cx = def.width / 2;
    const cy = def.height / 2;

    return (
        <Group
            x={symbol.x + cx}
            y={symbol.y + cy}
            rotation={symbol.rotation}
            scaleX={symbol.mirrored ? -1 : 1}
            offsetX={cx}
            offsetY={cy}
            draggable={tool === 'select'}
            onDragStart={() => {
                saveSnapshot();
                if (!isSelected) selectSymbol(symbol.id);
            }}
            onDragEnd={(e) => {
                const node = e.target;
                moveSymbol(symbol.id, node.x() - cx, node.y() - cy);
                autoSave();
            }}
            onClick={(e) => {
                e.cancelBubble = true;
                if (tool === 'select') {
                    selectSymbol(symbol.id, e.evt.shiftKey);
                }
            }}
            onMouseEnter={() => setHoveredId(symbol.id)}
            onMouseLeave={() => setHoveredId(null)}
        >
            {/* Component Body Background */}
            <Rect
                x={0}
                y={0}
                width={def.width}
                height={def.height}
                fill={darkMode ? '#1a1a2e' : '#ffffff'}
                stroke={isSelected ? '#00d4ff' : bodyColor}
                strokeWidth={1.5}
            />

            {/* Hover glow */}
            {(isHovered || isSelected) && (
                <Rect
                    x={-6}
                    y={-6}
                    width={def.width + 12}
                    height={def.height + 12}
                    fill={hoverGlow}
                    stroke={isSelected ? '#00d4ff' : 'rgba(132, 0, 0, 0.3)'}
                    strokeWidth={isSelected ? 1 : 0.5}
                    dash={isSelected ? [4, 4] : undefined}
                    cornerRadius={2}
                />
            )}

            {/* Graphics */}
            {def.graphics.map((g, i) => renderGraphic(g, i, bodyColor))}

            {/* Pins */}
            {def.pins.map((pin) => {
                const isPinHovered = hoveredPin === pin.id;

                // Pin line orientation adjustments
                let lx = 0, ly = 0;
                let nx = 0, ny = 0; // name pos
                let numX = 0, numY = 0; // number pos
                const l = pin.length || 20;

                if (pin.orientation === 'left') {
                    lx = -l; nx = 6; ny = -8; numX = -l / 2; numY = -12;
                } else if (pin.orientation === 'right') {
                    lx = l; nx = -l - 6; ny = -8; numX = l / 2; numY = -12;
                } else if (pin.orientation === 'up') {
                    ly = -l; nx = 6; ny = 6; numX = -12; numY = -l / 2;
                } else if (pin.orientation === 'down') {
                    ly = l; nx = 6; ny = -l - 12; numX = -12; numY = l / 2;
                }

                return (
                    <Group key={pin.id} x={pin.x} y={pin.y}>
                        {/* Pin Line */}
                        <Line
                            points={[0, 0, lx, ly]}
                            stroke={CAD_COLORS.pin}
                            strokeWidth={1.2}
                        />

                        {/* Internal Pin Name (Cyan) */}
                        <Text
                            x={nx}
                            y={ny}
                            text={pin.name}
                            fontSize={9}
                            fontFamily="Inter, sans-serif"
                            fill={CAD_COLORS.pinName}
                            offsetX={pin.orientation === 'right' ? 20 : 0}
                            align={pin.orientation === 'right' ? 'right' : 'left'}
                            width={40}
                        />

                        {/* External Pin Number (Red) */}
                        {pin.number && (
                            <Text
                                x={numX}
                                y={numY}
                                text={pin.number}
                                fontSize={8}
                                fontFamily="Inter, sans-serif"
                                fill={CAD_COLORS.pinNumber}
                                align="center"
                            />
                        )}

                        {/* Connection Circle at Tip */}
                        <Circle
                            x={lx}
                            y={ly}
                            radius={isPinHovered ? 4 : 2}
                            stroke={CAD_COLORS.pin}
                            strokeWidth={1}
                            fill={isPinHovered ? '#ff4444' : 'transparent'}
                            onMouseEnter={() => setHoveredPin(pin.id)}
                            onMouseLeave={() => setHoveredPin(null)}
                        />
                    </Group>
                );
            })}

            {/* Reference label (Cyan) */}
            <Text
                x={0}
                y={-18}
                text={symbol.properties.reference}
                fontSize={10}
                fontFamily="Inter, sans-serif"
                fill={CAD_COLORS.ref}
                fontStyle="bold"
            />

            {/* Value label (Cyan) */}
            <Text
                x={0}
                y={def.height + 6}
                text={symbol.properties.value || symbol.symbolRef.replace('sym_', '').toUpperCase()}
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fill={CAD_COLORS.val}
            />
        </Group>
    );
};

export default React.memo(SymbolRenderer);
