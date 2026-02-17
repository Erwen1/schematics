/* ──────────────────────────────────────────────
   RatsnestRenderer — Rendering Unrouted Connections
   ────────────────────────────────────────────── */

import React from 'react';
import { Line } from 'react-konva';
import { RatsnestLine } from '../../engine/ratsnest';

interface Props {
    lines: RatsnestLine[];
}

export const RatsnestRenderer: React.FC<Props> = ({ lines }) => {
    return (
        <>
            {lines.map((line, i) => (
                <Line
                    key={i}
                    points={[line.from.x, line.from.y, line.to.x, line.to.y]}
                    stroke="#ffffff"
                    strokeWidth={0.1}
                    opacity={0.4}
                    dash={[0.5, 0.5]}
                />
            ))}
        </>
    );
};
