/* ──────────────────────────────────────────────
   LibraryPanel — Left sidebar with symbol library
   Features: search, category filter, preview, drag-to-place
   ────────────────────────────────────────────── */

import React, { useState, useMemo } from 'react';
import { builtInSymbols, getCategories } from '../../data/symbolLibrary';
import { useSchematicStore } from '../../store/schematicStore';
import { SymbolDef, GraphicPrimitive } from '../../data/types';

const PREVIEW_SCALE = 1.8;
const PREVIEW_PADDING = 20;

/** Render a symbol preview as SVG */
function SymbolPreview({ def, darkMode }: { def: SymbolDef; darkMode: boolean }) {
    const stroke = darkMode ? '#c8c8e0' : '#333';
    const pinColor = darkMode ? '#22cc88' : '#008855';
    const w = def.width * PREVIEW_SCALE + PREVIEW_PADDING * 2;
    const h = def.height * PREVIEW_SCALE + PREVIEW_PADDING * 2;

    function renderGraphicSvg(g: GraphicPrimitive, idx: number) {
        switch (g.type) {
            case 'line':
                return (
                    <line
                        key={idx}
                        x1={g.x1 * PREVIEW_SCALE}
                        y1={g.y1 * PREVIEW_SCALE}
                        x2={g.x2 * PREVIEW_SCALE}
                        y2={g.y2 * PREVIEW_SCALE}
                        stroke={stroke}
                        strokeWidth={(g.strokeWidth || 1.5) * PREVIEW_SCALE * 0.6}
                        strokeLinecap="round"
                    />
                );
            case 'polyline': {
                const pts = [];
                for (let i = 0; i < g.points.length; i += 2) {
                    pts.push(`${g.points[i] * PREVIEW_SCALE},${g.points[i + 1] * PREVIEW_SCALE}`);
                }
                return (
                    <polyline
                        key={idx}
                        points={pts.join(' ')}
                        stroke={stroke}
                        strokeWidth={(g.strokeWidth || 1.5) * PREVIEW_SCALE * 0.6}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                );
            }
            case 'circle':
                return (
                    <circle
                        key={idx}
                        cx={g.cx * PREVIEW_SCALE}
                        cy={g.cy * PREVIEW_SCALE}
                        r={g.r * PREVIEW_SCALE}
                        stroke={stroke}
                        strokeWidth={1}
                        fill="none"
                    />
                );
            case 'arc': {
                const r = g.r * PREVIEW_SCALE;
                const start = (g.startAngle * Math.PI) / 180;
                const end = (g.endAngle * Math.PI) / 180;
                const cx = g.cx * PREVIEW_SCALE;
                const cy = g.cy * PREVIEW_SCALE;
                const x1 = cx + r * Math.cos(start);
                const y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end);
                const y2 = cy + r * Math.sin(end);
                const large = end - start > Math.PI ? 1 : 0;
                return (
                    <path
                        key={idx}
                        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                        stroke={stroke}
                        strokeWidth={1.5}
                        fill="none"
                    />
                );
            }
            case 'text':
                return (
                    <text
                        key={idx}
                        x={g.x * PREVIEW_SCALE}
                        y={g.y * PREVIEW_SCALE}
                        fontSize={(g.fontSize || 11) * PREVIEW_SCALE * 0.7}
                        fill={stroke}
                    >
                        {g.text}
                    </text>
                );
            default:
                return null;
        }
    }

    return (
        <svg width={w} height={h} className="symbol-preview-svg">
            <g transform={`translate(${PREVIEW_PADDING}, ${PREVIEW_PADDING})`}>
                {def.graphics.map((g, i) => renderGraphicSvg(g, i))}
                {def.pins.map((pin) => (
                    <circle
                        key={pin.id}
                        cx={pin.x * PREVIEW_SCALE}
                        cy={pin.y * PREVIEW_SCALE}
                        r={3}
                        fill={pinColor}
                    />
                ))}
            </g>
        </svg>
    );
}

const LibraryPanel: React.FC = () => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedDef, setSelectedDef] = useState<SymbolDef | null>(null);
    const darkMode = useSchematicStore((s) => s.darkMode);
    const setPlacingSymbol = useSchematicStore((s) => s.setPlacingSymbol);
    const placingSymbolRef = useSchematicStore((s) => s.placingSymbolRef);

    const categories = useMemo(() => getCategories(), []);

    const filteredSymbols = useMemo(() => {
        return builtInSymbols.filter((s) => {
            const matchSearch =
                !search ||
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.description || '').toLowerCase().includes(search.toLowerCase());
            const matchCat = !activeCategory || s.category === activeCategory;
            return matchSearch && matchCat;
        });
    }, [search, activeCategory]);

    const handleSelect = (def: SymbolDef) => {
        setSelectedDef(def);
    };

    const handlePlace = (def: SymbolDef) => {
        setPlacingSymbol(def.id);
    };

    return (
        <div className="library-panel">
            <div className="panel-header">
                <h3>⊞ Components</h3>
            </div>

            {/* Search */}
            <div className="library-search">
                <input
                    type="text"
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    spellCheck={false}
                />
            </div>

            {/* Category tabs */}
            <div className="category-tabs">
                <button
                    className={`category-tab ${!activeCategory ? 'active' : ''}`}
                    onClick={() => setActiveCategory(null)}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Symbol list */}
            <div className="symbol-list">
                {filteredSymbols.map((def) => (
                    <div
                        key={def.id}
                        className={`symbol-list-item ${selectedDef?.id === def.id ? 'selected' : ''} ${placingSymbolRef === def.id ? 'placing' : ''}`}
                        onClick={() => handleSelect(def)}
                        onDoubleClick={() => handlePlace(def)}
                    >
                        <div className="symbol-list-item-icon">
                            <SymbolPreview def={def} darkMode={darkMode} />
                        </div>
                        <div className="symbol-list-item-info">
                            <span className="symbol-name">{def.name}</span>
                            <span className="symbol-desc">{def.description || def.category}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview & Place button */}
            {selectedDef && (
                <div className="symbol-detail">
                    <div className="symbol-detail-preview">
                        <SymbolPreview def={selectedDef} darkMode={darkMode} />
                    </div>
                    <div className="symbol-detail-info">
                        <strong>{selectedDef.name}</strong>
                        <span>{selectedDef.description}</span>
                        <span className="symbol-detail-pins">
                            {selectedDef.pins.length} pin{selectedDef.pins.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <button
                        className="place-btn"
                        onClick={() => handlePlace(selectedDef)}
                    >
                        Place on Canvas
                    </button>
                </div>
            )}
        </div>
    );
};

export default LibraryPanel;
