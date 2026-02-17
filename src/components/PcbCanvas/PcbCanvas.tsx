/* ──────────────────────────────────────────────
   PcbCanvas — Main PCB Layout Rendering Area
   ────────────────────────────────────────────── */

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import { usePcbStore } from '../../store/pcbStore';
import { useSchematicStore } from '../../store/schematicStore';
import { FootprintRenderer } from './FootprintRenderer';
import { TraceRenderer } from './TraceRenderer';
import { RatsnestRenderer } from './RatsnestRenderer';
import { BoardOutlineRenderer } from './BoardOutlineRenderer';

export const PcbCanvas: React.FC = () => {
    const stageRef = useRef<any>(null);
    const {
        footprints, traces, vias, outline, ratsnest,
        stagePos, stageScale, tool, activeLayer,
        traceInProgress, selectedIds,
        setStagePos, setStageScale, moveFootprint,
        startTrace, addTracePoint, finishTrace,
    } = usePcbStore();

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        setStageScale(newScale);

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        setStagePos(newPos);
    };

    const handleMouseDown = (e: any) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const worldPos = {
            x: (pos.x - stage.x()) / stage.scaleX(),
            y: (pos.y - stage.y()) / stage.scaleY(),
        };

        if (tool === 'route') {
            if (!traceInProgress) {
                startTrace(worldPos);
            } else {
                addTracePoint(worldPos);
            }
        }
    };

    const handleMouseMove = (e: any) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (pos) {
            setMousePos({
                x: (pos.x - stage.x()) / stage.scaleX(),
                y: (pos.y - stage.y()) / stage.scaleY(),
            });
        }
    };

    const handleDblClick = () => {
        if (tool === 'route') finishTrace();
    };

    return (
        <div className="pcb-canvas-container" style={{ width: '100%', height: '100%', background: '#0a0a0a', overflow: 'hidden' }}>
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onDblClick={handleDblClick}
                draggable={tool === 'select'}
            >
                <Layer>
                    {/* Background Grid */}
                    <Rect
                        x={-5000} y={-5000} width={10000} height={10000}
                        fill="#0a0a0a"
                    />

                    {/* Board Outline */}
                    <BoardOutlineRenderer outline={outline} />

                    {/* Ratsnest */}
                    <RatsnestRenderer lines={ratsnest} />

                    {/* Traces and Vias */}
                    <TraceRenderer
                        traces={traces}
                        vias={vias}
                        previewPoints={traceInProgress ? [...traceInProgress, mousePos] : null}
                        activeLayer={activeLayer}
                    />

                    {/* Footprints */}
                    {footprints.map(fp => (
                        <FootprintRenderer
                            key={fp.id}
                            instance={fp}
                            selected={selectedIds.includes(fp.id)}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};
