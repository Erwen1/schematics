/* ──────────────────────────────────────────────
   Grid — Draws the dot grid background
   ────────────────────────────────────────────── */

import React, { useMemo } from 'react';
import { Layer, Circle, Line } from 'react-konva';

interface GridProps {
    width: number;
    height: number;
    gridSize: number;
    scale: number;
    stagePos: { x: number; y: number };
    darkMode: boolean;
}

const Grid: React.FC<GridProps> = ({ width, height, gridSize, scale, stagePos, darkMode }) => {
    const dots = useMemo(() => {
        const result: { x: number; y: number }[] = [];
        const effectiveGrid = gridSize;

        // Calculate visible area in canvas coordinates
        const startX = Math.floor(-stagePos.x / scale / effectiveGrid) * effectiveGrid - effectiveGrid;
        const startY = Math.floor(-stagePos.y / scale / effectiveGrid) * effectiveGrid - effectiveGrid;
        const endX = startX + (width / scale) + effectiveGrid * 2;
        const endY = startY + (height / scale) + effectiveGrid * 2;

        for (let x = startX; x <= endX; x += effectiveGrid) {
            for (let y = startY; y <= endY; y += effectiveGrid) {
                result.push({ x, y });
            }
        }
        return result;
    }, [width, height, gridSize, scale, stagePos.x, stagePos.y]);

    const dotColor = darkMode ? '#2a2a3a' : '#d0d0d0';
    const originColor = darkMode ? '#4a4a6a' : '#888';

    return (
        <Layer listening={false}>
            {dots.map((dot, i) => (
                <Circle
                    key={i}
                    x={dot.x}
                    y={dot.y}
                    radius={1 / scale}
                    fill={dotColor}
                />
            ))}
            {/* Origin cross-hair */}
            <Line points={[-40, 0, 40, 0]} stroke={originColor} strokeWidth={0.5 / scale} />
            <Line points={[0, -40, 0, 40]} stroke={originColor} strokeWidth={0.5 / scale} />
        </Layer>
    );
};

export default React.memo(Grid);
