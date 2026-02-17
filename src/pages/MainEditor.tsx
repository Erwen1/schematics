/* ──────────────────────────────────────────────
   MainEditor — Primary schematic/PCB editor page
   ────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import SchematicCanvas from '../components/Canvas/SchematicCanvas';
import Toolbar from '../components/Toolbar/Toolbar';
import LibraryPanel from '../components/LibraryPanel/LibraryPanel';
import PropertiesPanel from '../components/PropertiesPanel/PropertiesPanel';
import ErcPanel from '../components/ErcPanel/ErcPanel';
import ContextMenu from '../components/ContextMenu/ContextMenu';
import BomDialog from '../components/BomDialog/BomDialog';
import { SheetNavigator } from '../components/SheetNavigator/SheetNavigator';
import { NetClassPanel } from '../components/NetClassPanel/NetClassPanel';
import { useSchematicStore } from '../store/schematicStore';
import '../App.css';

// PCB Imports
import { PcbCanvas } from '../components/PcbCanvas/PcbCanvas';
import { PcbToolbar } from '../components/PcbToolbar/PcbToolbar';
import { LayerPanel } from '../components/LayerPanel/LayerPanel';
import { DrcPanel } from '../components/DrcPanel/DrcPanel';

// AI Imports
import { AiCommandBar } from '../components/AiCommandBar/AiCommandBar';
import { DesignAdvisor } from '../components/DesignAdvisor/DesignAdvisor';

const MainEditor: React.FC = () => {
    const darkMode = useSchematicStore((s: any) => s.darkMode);
    const setTool = useSchematicStore((s: any) => s.setTool);
    const rotateSelected = useSchematicStore((s: any) => s.rotateSelected);
    const flipSelected = useSchematicStore((s: any) => s.flipSelected);
    const deleteSelected = useSchematicStore((s: any) => s.deleteSelected);
    const duplicateSelected = useSchematicStore((s: any) => s.duplicateSelected);
    const undo = useSchematicStore((s: any) => s.undo);
    const redo = useSchematicStore((s: any) => s.redo);
    const cancelWire = useSchematicStore((s: any) => s.cancelWire);
    const finishWire = useSchematicStore((s: any) => s.finishWire);
    const loadAutoSave = useSchematicStore((s: any) => s.loadAutoSave);
    const closeContextMenu = useSchematicStore((s: any) => s.closeContextMenu);

    const [bomOpen, setBomOpen] = useState(false);
    const [activeView, setActiveView] = useState<'schematic' | 'pcb'>('schematic');

    // Load autosave on mount
    useEffect(() => {
        loadAutoSave();
    }, []);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case 'v':
                    setActiveView(prev => prev === 'schematic' ? 'pcb' : 'schematic');
                    break;
                case 'r':
                    rotateSelected();
                    break;
                case 'w':
                    if (activeView === 'schematic') setTool('wire');
                    break;
                case 'j':
                    if (activeView === 'schematic') setTool('junction');
                    break;
                case 'l':
                    if (activeView === 'schematic') setTool('netlabel');
                    break;
                case 'b':
                    if (activeView === 'schematic') setTool('bus');
                    break;
                case 'f':
                    flipSelected();
                    break;
                case 'escape':
                    cancelWire();
                    closeContextMenu();
                    setTool('select');
                    break;
                case 'delete':
                case 'backspace':
                    deleteSelected();
                    break;
                case 'enter':
                    finishWire();
                    break;
                case 'd':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        duplicateSelected();
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        redo();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setTool, rotateSelected, flipSelected, deleteSelected, duplicateSelected, undo, redo, cancelWire, finishWire, closeContextMenu, activeView]);

    return (
        <div className={`app ${darkMode ? 'dark' : 'light'}`}>
            <AiCommandBar />

            <div className="app-header">
                <div className="view-switcher">
                    <button
                        className={`view-tab ${activeView === 'schematic' ? 'active' : ''}`}
                        onClick={() => setActiveView('schematic')}
                    >
                        Schematic Editor
                    </button>
                    <button
                        className={`view-tab ${activeView === 'pcb' ? 'active' : ''}`}
                        onClick={() => setActiveView('pcb')}
                    >
                        PCB Layout
                    </button>
                    <button
                        className="view-tab"
                        onClick={() => window.location.href = '/iot-test'}
                        style={{ marginLeft: '10px', background: 'var(--accent-gradient)' }}
                    >
                        ⚡ IoT Lab
                    </button>
                </div>
                {activeView === 'schematic' ? (
                    <Toolbar onOpenBom={() => setBomOpen(true)} />
                ) : (
                    <PcbToolbar />
                )}
            </div>

            {activeView === 'schematic' && <SheetNavigator />}

            <div className="main-content">
                {activeView === 'schematic' && <LibraryPanel />}

                <div className="canvas-area">
                    {activeView === 'schematic' ? (
                        <SchematicCanvas />
                    ) : (
                        <PcbCanvas />
                    )}
                </div>

                <div className="right-panels">
                    <DesignAdvisor />
                    <div className="panel-divider" />
                    {activeView === 'schematic' ? (
                        <>
                            <PropertiesPanel />
                            <NetClassPanel />
                        </>
                    ) : (
                        <>
                            <LayerPanel />
                            <DrcPanel />
                        </>
                    )}
                </div>
            </div>

            {activeView === 'schematic' && <ErcPanel />}
            <ContextMenu />
            <BomDialog open={bomOpen} onClose={() => setBomOpen(false)} />
        </div>
    );
};

export default MainEditor;
