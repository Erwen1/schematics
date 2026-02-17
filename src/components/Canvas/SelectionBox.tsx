/* ──────────────────────────────────────────────
   SelectionBox — Rubber-band selection rectangle
   ────────────────────────────────────────────── */

import React from 'react';
import { Rect } from 'react-konva';

interface SelectionBoxProps {
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
    darkMode: boolean;
}

const SelectionBox: React.FC<SelectionBoxProps> = ({ start, end, darkMode }) => {
    if (!start || !end) return null;

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);

    return (
        <Rect
            x={x}
            y={y}
            width={w}
            height={h}
            stroke={darkMode ? '#00d4ff' : '#0088cc'}
            strokeWidth={1}
            dash={[4, 4]}
            fill={darkMode ? 'rgba(0, 212, 255, 0.05)' : 'rgba(0, 136, 204, 0.08)'}
        />
    );
};

export default SelectionBox;
