/* ──────────────────────────────────────────────
   PcbToolbar — PCB Layout Specific Actions
   ────────────────────────────────────────────── */

import React from 'react';
import { usePcbStore } from '../../store/pcbStore';
import { useSchematicStore } from '../../store/schematicStore';
import { PcbToolMode } from '../../data/types';

export const PcbToolbar: React.FC = () => {
    const { tool, setTool, importFromSchematic } = usePcbStore();
    const { symbols, nets, netClasses } = useSchematicStore();

    const tools: { mode: PcbToolMode, icon: string, label: string }[] = [
        { mode: 'select', icon: '⊹', label: 'Select' },
        { mode: 'route', icon: '⌇', label: 'Route' },
        { mode: 'via', icon: '⊕', label: 'Via' },
        { mode: 'outline', icon: '⬔', label: 'Outline' },
    ];

    return (
        <div className="pcb-toolbar">
            <div className="toolbar-group">
                {tools.map(t => (
                    <button
                        key={t.mode}
                        className={`toolbar-btn ${tool === t.mode ? 'active' : ''}`}
                        onClick={() => setTool(t.mode)}
                        title={t.label}
                    >
                        <span className="toolbar-btn-icon">{t.icon}</span>
                        <span className="toolbar-btn-label">{t.label}</span>
                    </button>
                ))}
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-group">
                <button
                    className="toolbar-btn special"
                    onClick={() => importFromSchematic(symbols, nets, netClasses)}
                    title="Import Netlist from Schematic"
                >
                    <span className="toolbar-btn-icon">📥</span>
                    <span className="toolbar-btn-label">Import</span>
                </button>
            </div>
        </div>
    );
};
