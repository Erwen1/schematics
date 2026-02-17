/* ──────────────────────────────────────────────
   PropertiesPanel — Right sidebar
   Shows/edits properties of selected symbol
   ────────────────────────────────────────────── */

import React from 'react';
import { useSchematicStore } from '../../store/schematicStore';
import { symbolMap } from '../../data/symbolLibrary';

const PropertiesPanel: React.FC = () => {
    const symbols = useSchematicStore((s) => s.symbols);
    const selectedIds = useSchematicStore((s) => s.selectedIds);
    const updateSymbolProperty = useSchematicStore((s) => s.updateSymbolProperty);
    const nets = useSchematicStore((s) => s.nets);
    const darkMode = useSchematicStore((s) => s.darkMode);

    const selectedSymbols = symbols.filter((s) => selectedIds.includes(s.id));

    if (selectedSymbols.length === 0) {
        return (
            <div className="properties-panel">
                <div className="panel-header">
                    <h3>⚙ Properties</h3>
                </div>
                <div className="properties-empty">
                    <p>No component selected</p>
                    <p className="hint">Click a component to view its properties</p>
                </div>
            </div>
        );
    }

    if (selectedSymbols.length > 1) {
        return (
            <div className="properties-panel">
                <div className="panel-header">
                    <h3>⚙ Properties</h3>
                </div>
                <div className="properties-multi">
                    <p>{selectedSymbols.length} components selected</p>
                </div>
            </div>
        );
    }

    const sym = selectedSymbols[0];
    const def = symbolMap.get(sym.symbolRef);

    // Find nets this symbol is on
    const symbolNets = nets.filter((n) =>
        n.pinRefs.some((pr) => pr.symbolId === sym.id)
    );

    return (
        <div className="properties-panel">
            <div className="panel-header">
                <h3>⚙ Properties</h3>
            </div>

            <div className="properties-content">
                {/* Symbol type */}
                <div className="prop-section">
                    <label className="prop-section-title">Component</label>
                    <div className="prop-row">
                        <span className="prop-label">Type</span>
                        <span className="prop-value">{def?.name || sym.symbolRef}</span>
                    </div>
                    <div className="prop-row">
                        <span className="prop-label">Category</span>
                        <span className="prop-value">{def?.category || '—'}</span>
                    </div>
                </div>

                {/* Editable properties */}
                <div className="prop-section">
                    <label className="prop-section-title">Designator</label>
                    <div className="prop-row">
                        <span className="prop-label">Reference</span>
                        <input
                            className="prop-input"
                            value={sym.properties.reference}
                            onChange={(e) => updateSymbolProperty(sym.id, 'reference', e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                    <div className="prop-row">
                        <span className="prop-label">Value</span>
                        <input
                            className="prop-input"
                            value={sym.properties.value}
                            onChange={(e) => updateSymbolProperty(sym.id, 'value', e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Position */}
                <div className="prop-section">
                    <label className="prop-section-title">Position</label>
                    <div className="prop-row">
                        <span className="prop-label">X</span>
                        <span className="prop-value mono">{sym.x}</span>
                    </div>
                    <div className="prop-row">
                        <span className="prop-label">Y</span>
                        <span className="prop-value mono">{sym.y}</span>
                    </div>
                    <div className="prop-row">
                        <span className="prop-label">Rotation</span>
                        <span className="prop-value mono">{sym.rotation}°</span>
                    </div>
                </div>

                {/* Pins */}
                {def && (
                    <div className="prop-section">
                        <label className="prop-section-title">Pins ({def.pins.length})</label>
                        {def.pins.map((pin) => (
                            <div className="prop-row" key={pin.id}>
                                <span className="prop-label">{pin.name}</span>
                                <span className="prop-value pin-type">{pin.electricalType}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Nets */}
                {symbolNets.length > 0 && (
                    <div className="prop-section">
                        <label className="prop-section-title">Nets</label>
                        {symbolNets.map((net) => (
                            <div className="prop-row" key={net.id}>
                                <span className="prop-label net-label">{net.name || net.id}</span>
                                <span className="prop-value">{net.pinRefs.length} pins</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;
