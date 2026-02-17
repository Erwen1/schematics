/* ──────────────────────────────────────────────
   BoardOutlineRenderer — Rendering Board Edge Cuts
   ────────────────────────────────────────────── */

import React from 'react';
import { Line } from 'react-konva';
import { BoardOutline } from '../../data/types';
import { getLayerColor } from '../../engine/layerStack';

interface Props {
    outline: BoardOutline;
}

export const BoardOutlineRenderer: React.FC<Props> = ({ outline }) => {
    if (outline.points.length < 2) return null;

    return (
        <Line
            points={outline.points.flatMap(p => [p.x, p.y])}
            stroke={getLayerColor('Edge.Cuts')}
            strokeWidth={0.2}
            closed={true}
            dash={[1, 1]}
        />
    );
};
