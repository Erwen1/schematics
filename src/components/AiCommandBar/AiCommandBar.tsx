/* ──────────────────────────────────────────────
   AiCommandBar — Natural Language Input
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useAiStore } from '../../store/aiStore';
import { useSchematicStore } from '../../store/schematicStore';
import { usePcbStore } from '../../store/pcbStore';
import { generateFromPrompt } from '../../engine/aiSchematicEngine';
import { autoPlaceFootprints } from '../../engine/aiPcbEngine';

export const AiCommandBar: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const { addPrompt, setResponse } = useAiStore();
    const { addSymbol } = useSchematicStore();
    const { footprints, ratsnest, importFromSchematic } = usePcbStore();

    const handleExecute = () => {
        if (!prompt.trim()) return;

        addPrompt(prompt);
        const lower = prompt.toLowerCase();

        // 1. Check for PCB optimization commands
        if (lower.includes('place') || lower.includes('optimize') || lower.includes('layout')) {
            usePcbStore.getState().performAutoPlace();
            setResponse('Optimizing PCB layout using force-directed physics...');
        }
        else if (lower.includes('fix') || lower.includes('drc') || lower.includes('clearance')) {
            const { nets, netClasses } = useSchematicStore.getState();
            usePcbStore.getState().performAutoDrc(nets, netClasses);
            setResponse('Resolving DRC clearance violations by nudging components...');
        }
        // 2. Default: Schematic Generation
        else {
            const { symbols: existingSymbols } = useSchematicStore.getState();
            const result = generateFromPrompt(prompt, existingSymbols);
            if (result.symbols.length > 0 || result.wires.length > 0) {
                useSchematicStore.getState().addGeneratedSubsystem(result.symbols, result.wires);
                setResponse(`Generated ${result.symbols.length} components and ${result.wires.length} wires for your request.`);
            } else {
                setResponse("Pardon? I didn't find any matching templates for that request.");
            }
        }

        setPrompt('');
    };

    return (
        <div className="ai-command-bar">
            <div className="command-input-wrapper">
                <span className="command-prefix">✨</span>
                <input
                    type="text"
                    placeholder="Describe your circuit or optimize layout..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                />
                <button className="magic-btn" onClick={handleExecute}>
                    Magic
                </button>
            </div>
        </div>
    );
};
