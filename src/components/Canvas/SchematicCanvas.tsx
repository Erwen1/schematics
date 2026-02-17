/* ──────────────────────────────────────────────
   SchematicCanvas — Main Konva Stage
   Handles zoom, pan, wire drawing, symbol placement,
   junctions, net labels, and context menu
   ────────────────────────────────────────────── */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import Grid from './Grid';
import SymbolRenderer from './SymbolRenderer';
import WireGroup from './WireRenderer';
import SelectionBox from './SelectionBox';
import { BusRenderer } from './BusRenderer';
import { SheetRenderer } from './SheetRenderer';
import { useSchematicStore } from '../../store/schematicStore';

const ZOOM_SPEED = 1.08;
const GRID_SIZE = 20;

function snapToGrid(val: number): number {
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

const SchematicCanvas: React.FC = () => {
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ width: 800, height: 600 });
    const [selBox, setSelBox] = useState<{
        start: { x: number; y: number } | null;
        end: { x: number; y: number } | null;
    }>({ start: null, end: null });

    const {
        symbols,
        wires,
        junctions,
        netLabels,
        busEntries,
        sheetInstances,
        sheetDefs,
        wireInProgress,
        busWireInProgress,
        selectedIds,
        stagePos,
        stageScale,
        gridSize,
        tool,
        placingSymbolRef,
        darkMode,
        nets,
        mousePos,
        setStagePos,
        setStageScale,
        setMousePos,
        clearSelection,
        addSymbol,
        startWire,
        addWirePoint,
        finishWire,
        startBusWire,
        addBusWirePoint,
        finishBusWire,
        addBusEntry,
        selectArea,
        addJunction,
        addNetLabel,
        openContextMenu,
    } = useSchematicStore();

    // Resize observer
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const obs = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDims({ width, height });
        });
        obs.observe(container);
        return () => obs.disconnect();
    }, []);

    // Get pointer position in canvas coords
    const getPointerPos = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return null;
        const pos = stage.getPointerPosition();
        if (!pos) return null;
        const transform = stage.getAbsoluteTransform().copy().invert();
        return transform.point(pos);
    }, []);

    // Zoom with scroll wheel
    const handleWheel = useCallback(
        (e: Konva.KonvaEventObject<WheelEvent>) => {
            e.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;

            const oldScale = stageScale;
            const pointer = stage.getPointerPosition()!;
            const mousePointTo = {
                x: (pointer.x - stagePos.x) / oldScale,
                y: (pointer.y - stagePos.y) / oldScale,
            };

            const direction = e.evt.deltaY < 0 ? 1 : -1;
            const newScale = direction > 0 ? oldScale * ZOOM_SPEED : oldScale / ZOOM_SPEED;

            setStageScale(newScale);
            setStagePos({
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            });
        },
        [stageScale, stagePos, setStageScale, setStagePos]
    );

    // Mouse down on stage
    const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            // Right click → context menu
            if (e.evt.button === 2) {
                e.evt.preventDefault();
                return;
            }

            // Only process clicks on the stage itself (not symbols)
            if (e.target !== e.currentTarget) return;
            const pos = getPointerPos();
            if (!pos) return;

            if (tool === 'place' && placingSymbolRef) {
                addSymbol(placingSymbolRef, pos.x, pos.y);
            } else if (tool === 'wire') {
                if (!wireInProgress) {
                    startWire(pos);
                } else {
                    addWirePoint(pos);
                }
            } else if (tool === 'bus') {
                if (!busWireInProgress) {
                    startBusWire(pos);
                } else {
                    addBusWirePoint(pos);
                }
            } else if (tool === 'busentry') {
                const busName = prompt('Bus net name (e.g. DATA):');
                const idx = prompt('Member index (e.g. 0):');
                if (busName && idx !== null) {
                    addBusEntry(pos.x, pos.y, busName, parseInt(idx) || 0);
                }
            } else if (tool === 'junction') {
                addJunction(pos.x, pos.y);
            } else if (tool === 'netlabel') {
                const name = prompt('Net label name:');
                if (name) {
                    addNetLabel(pos.x, pos.y, name);
                }
            } else if (tool === 'select') {
                clearSelection();
                setSelBox({ start: pos, end: pos });
            }
        },
        [tool, placingSymbolRef, wireInProgress, busWireInProgress, getPointerPos, addSymbol, startWire, addWirePoint, startBusWire, addBusWirePoint, addBusEntry, clearSelection, addJunction, addNetLabel]
    );

    // Mouse move — selection box + ghost wire
    const handleMouseMove = useCallback(() => {
        const pos = getPointerPos();
        if (!pos) return;

        // Always update mouse position for ghost wire
        setMousePos({ x: snapToGrid(pos.x), y: snapToGrid(pos.y) });

        if (selBox.start) {
            setSelBox((s) => ({ ...s, end: pos }));
        }
    }, [selBox.start, getPointerPos, setMousePos]);

    // Mouse up on stage
    const handleMouseUp = useCallback(() => {
        if (selBox.start && selBox.end) {
            const minX = Math.min(selBox.start.x, selBox.end.x);
            const minY = Math.min(selBox.start.y, selBox.end.y);
            const maxX = Math.max(selBox.start.x, selBox.end.x);
            const maxY = Math.max(selBox.start.y, selBox.end.y);

            const inBox = symbols
                .filter((s) => s.x >= minX && s.y >= minY && s.x <= maxX && s.y <= maxY)
                .map((s) => s.id);

            if (inBox.length > 0) selectArea(inBox);
            setSelBox({ start: null, end: null });
        }
    }, [selBox, symbols, selectArea]);

    // Double-click to finish wire or bus wire
    const handleDblClick = useCallback(() => {
        if (tool === 'wire' && wireInProgress) {
            finishWire();
        }
        if (tool === 'bus' && busWireInProgress) {
            const label = prompt('Bus label (e.g. DATA[0..7]):');
            if (label) finishBusWire(label);
        }
    }, [tool, wireInProgress, busWireInProgress, finishWire, finishBusWire]);

    // Context menu
    const handleContextMenu = useCallback(
        (e: Konva.KonvaEventObject<PointerEvent>) => {
            e.evt.preventDefault();
            e.evt.stopPropagation();
            const pos = getPointerPos();
            if (!pos) return;
            openContextMenu(e.evt.clientX, e.evt.clientY, pos.x, pos.y);
        },
        [getPointerPos, openContextMenu]
    );

    const bgColor = darkMode ? '#0d0d1a' : '#e0e5f0'; // Changed from #f5f5f8 to force refresh
    const cursorStyle =
        tool === 'wire' || tool === 'bus' || tool === 'junction' || tool === 'netlabel' || tool === 'busentry' || tool === 'sheetport'
            ? 'crosshair'
            : tool === 'place'
                ? 'copy'
                : tool === 'delete'
                    ? 'not-allowed'
                    : 'default';

    return (
        <div
            ref={containerRef}
            className="schematic-canvas-container"
            style={{ cursor: cursorStyle }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <Stage
                ref={stageRef}
                width={dims.width}
                height={dims.height}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                draggable={tool === 'select' && !selBox.start}
                onDragEnd={(e) => {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDblClick={handleDblClick}
                onContextMenu={handleContextMenu}
                style={{ backgroundColor: bgColor }}
            >
                {/* Grid */}
                <Grid
                    width={dims.width}
                    height={dims.height}
                    gridSize={gridSize}
                    scale={stageScale}
                    stagePos={stagePos}
                    darkMode={darkMode}
                />

                {/* Symbols + Wires */}
                <Layer>
                    <WireGroup
                        wires={wires}
                        junctions={junctions}
                        netLabels={netLabels}
                        wireInProgress={wireInProgress}
                        darkMode={darkMode}
                    />
                    <BusRenderer
                        busWires={wires.filter((w) => w.isBus)}
                        busEntries={busEntries}
                        busWireInProgress={busWireInProgress}
                        mousePos={mousePos}
                    />
                    <SheetRenderer
                        sheetInstances={sheetInstances}
                        sheetDefs={sheetDefs}
                    />
                    {symbols.map((sym) => (
                        <SymbolRenderer
                            key={sym.id}
                            symbol={sym}
                            isSelected={selectedIds.includes(sym.id)}
                            darkMode={darkMode}
                        />
                    ))}
                    <SelectionBox
                        start={selBox.start}
                        end={selBox.end}
                        darkMode={darkMode}
                    />
                </Layer>
            </Stage>

            {/* Status bar */}
            <div className="status-bar">
                <span className="status-item">
                    🧩 {symbols.length} components
                </span>
                <span className="status-item">
                    🔗 {nets.length} nets
                </span>
                <span className="status-item">
                    🔌 {wires.length} wires
                </span>
                <span className="status-separator">|</span>
                <span className="status-item">
                    {Math.round(stageScale * 100)}%
                </span>
            </div>
        </div>
    );
};

export default SchematicCanvas;
