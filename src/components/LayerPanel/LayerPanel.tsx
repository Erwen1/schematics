/* ──────────────────────────────────────────────
   LayerPanel — PCB Layer Visibility and Selection
   ────────────────────────────────────────────── */

import React from 'react';
import { usePcbStore } from '../../store/pcbStore';
import { PcbLayer } from '../../data/types';

export const LayerPanel: React.FC = () => {
    const { layers, activeLayer, toggleLayerVisibility, setActiveLayer } = usePcbStore();

    return (
        <div className="layer-panel">
            <div className="panel-header">
                <h3>Layers</h3>
            </div>
            <div className="layer-list">
                {layers.map(layer => (
                    <div
                        key={layer.id}
                        className={`layer-item ${activeLayer === layer.id ? 'active' : ''}`}
                        onClick={() => setActiveLayer(layer.id)}
                    >
                        <div
                            className="layer-visibility-toggle"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id as PcbLayer);
                            }}
                            style={{ opacity: layer.visible ? 1 : 0.3 }}
                        >
                            {layer.visible ? '👁️' : '👓'}
                        </div>
                        <div
                            className="layer-color-swatch"
                            style={{ backgroundColor: layer.color }}
                        />
                        <span className="layer-name">{layer.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
