/* ──────────────────────────────────────────────
   Toolbar — Top toolbar with tools and actions
   ────────────────────────────────────────────── */

import React, { useRef } from 'react';
import { useSchematicStore } from '../../store/schematicStore';
import { ToolMode } from '../../data/types';

const tools: { mode: ToolMode; icon: string; label: string; shortcut?: string }[] = [
    { mode: 'select', icon: '⊹', label: 'Select', shortcut: 'Esc' },
    { mode: 'wire', icon: '⌇', label: 'Wire', shortcut: 'W' },
    { mode: 'bus', icon: '☰', label: 'Bus', shortcut: 'B' },
    { mode: 'busentry', icon: '⤡', label: 'Bus Entry' },
    { mode: 'place', icon: '⊞', label: 'Place', shortcut: 'P' },
    { mode: 'junction', icon: '⊕', label: 'Junction', shortcut: 'J' },
    { mode: 'netlabel', icon: '🏷', label: 'Net Label', shortcut: 'L' },
    { mode: 'delete', icon: '✕', label: 'Delete', shortcut: 'Del' },
];

interface ToolbarProps {
    onOpenBom: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onOpenBom }) => {
    const {
        tool,
        setTool,
        undo,
        redo,
        runErc,
        newProject,
        saveProject,
        loadProject,
        toggleDarkMode,
        darkMode,
        projectName,
        setProjectName,
        deleteSelected,
        autoAnnotate,
        addSheet,
        alignSelectedLeft,
        alignSelectedTop,
        distributeSelectedH,
        distributeSelectedV,
        selectedIds,
    } = useSchematicStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const json = saveProject();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_')}.sch.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const json = ev.target?.result as string;
            loadProject(json);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleToolClick = (mode: ToolMode) => {
        if (mode === 'delete') {
            deleteSelected();
            return;
        }
        setTool(mode);
    };

    const hasMultiSelect = selectedIds.length >= 2;

    return (
        <div className="toolbar">
            <div className="toolbar-section toolbar-brand">
                <span className="toolbar-logo">◈</span>
                <input
                    className="project-name-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    spellCheck={false}
                />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-section">
                {tools.map((t) => (
                    <button
                        key={t.mode}
                        className={`toolbar-btn ${tool === t.mode ? 'active' : ''}`}
                        onClick={() => handleToolClick(t.mode)}
                        title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
                    >
                        <span className="toolbar-btn-icon">{t.icon}</span>
                        <span className="toolbar-btn-label">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={undo} title="Undo (Ctrl+Z)">
                    <span className="toolbar-btn-icon">↶</span>
                    <span className="toolbar-btn-label">Undo</span>
                </button>
                <button className="toolbar-btn" onClick={redo} title="Redo (Ctrl+Y)">
                    <span className="toolbar-btn-icon">↷</span>
                    <span className="toolbar-btn-label">Redo</span>
                </button>
            </div>

            <div className="toolbar-divider" />

            {/* Annotation & BOM */}
            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={autoAnnotate} title="Auto Annotate">
                    <span className="toolbar-btn-icon">🏷</span>
                    <span className="toolbar-btn-label">Annotate</span>
                </button>
                <button className="toolbar-btn" onClick={onOpenBom} title="Bill of Materials">
                    <span className="toolbar-btn-icon">📋</span>
                    <span className="toolbar-btn-label">BOM</span>
                </button>
                <button className="toolbar-btn erc-btn" onClick={runErc} title="Run ERC">
                    <span className="toolbar-btn-icon">⚡</span>
                    <span className="toolbar-btn-label">ERC</span>
                </button>
                <button className="toolbar-btn" onClick={() => {
                    const name = window.prompt('Sheet name:', 'SubSheet');
                    if (name) addSheet(name, 200, 200);
                }} title="Add Hierarchical Sheet (H)">
                    <span className="toolbar-btn-icon">📑</span>
                    <span className="toolbar-btn-label">Sheet</span>
                </button>
            </div>

            <div className="toolbar-divider" />

            {/* Align/Distribute */}
            <div className="toolbar-section">
                <button
                    className="toolbar-btn"
                    onClick={alignSelectedLeft}
                    disabled={!hasMultiSelect}
                    title="Align Left (needs 2+ selected)"
                >
                    <span className="toolbar-btn-icon">⫤</span>
                </button>
                <button
                    className="toolbar-btn"
                    onClick={alignSelectedTop}
                    disabled={!hasMultiSelect}
                    title="Align Top (needs 2+ selected)"
                >
                    <span className="toolbar-btn-icon">⊤</span>
                </button>
                <button
                    className="toolbar-btn"
                    onClick={distributeSelectedH}
                    disabled={selectedIds.length < 3}
                    title="Distribute Horizontal (needs 3+ selected)"
                >
                    <span className="toolbar-btn-icon">⇔</span>
                </button>
                <button
                    className="toolbar-btn"
                    onClick={distributeSelectedV}
                    disabled={selectedIds.length < 3}
                    title="Distribute Vertical (needs 3+ selected)"
                >
                    <span className="toolbar-btn-icon">⇕</span>
                </button>
            </div>

            <div className="toolbar-spacer" />

            <div className="toolbar-section">
                <button className="toolbar-btn" onClick={newProject} title="New Project">
                    <span className="toolbar-btn-icon">📄</span>
                </button>
                <button className="toolbar-btn" onClick={handleSave} title="Save Project">
                    <span className="toolbar-btn-icon">💾</span>
                </button>
                <button className="toolbar-btn" onClick={handleLoad} title="Load Project">
                    <span className="toolbar-btn-icon">📂</span>
                </button>
                <button className="toolbar-btn" onClick={toggleDarkMode} title="Toggle Theme">
                    <span className="toolbar-btn-icon">{darkMode ? '☀️' : '🌙'}</span>
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.sch.json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default Toolbar;
