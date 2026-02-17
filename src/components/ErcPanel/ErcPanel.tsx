/* ──────────────────────────────────────────────
   ErcPanel — Bottom console showing ERC results
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useSchematicStore } from '../../store/schematicStore';

const ErcPanel: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const ercViolations = useSchematicStore((s) => s.ercViolations);
    const selectSymbol = useSchematicStore((s) => s.selectSymbol);
    const runErc = useSchematicStore((s) => s.runErc);

    const errors = ercViolations.filter((v) => v.severity === 'error');
    const warnings = ercViolations.filter((v) => v.severity === 'warning');

    const handleViolationClick = (v: typeof ercViolations[0]) => {
        if (v.symbolIds && v.symbolIds.length > 0) {
            selectSymbol(v.symbolIds[0]);
        }
    };

    const severityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return '🔴';
            case 'warning': return '🟡';
            case 'info': return '🔵';
            default: return '⚪';
        }
    };

    return (
        <div className={`erc-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div
                className="erc-panel-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="erc-header-left">
                    <span className="erc-toggle">{isExpanded ? '▾' : '▸'}</span>
                    <span className="erc-title">⚡ ERC Console</span>
                    {ercViolations.length > 0 && (
                        <span className="erc-badge">
                            {errors.length > 0 && (
                                <span className="erc-count error">{errors.length} errors</span>
                            )}
                            {warnings.length > 0 && (
                                <span className="erc-count warning">{warnings.length} warnings</span>
                            )}
                        </span>
                    )}
                    {ercViolations.length === 0 && (
                        <span className="erc-badge clean">✓ Clean</span>
                    )}
                </div>
                <button
                    className="erc-run-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        runErc();
                    }}
                >
                    Run ERC
                </button>
            </div>

            {isExpanded && (
                <div className="erc-panel-body">
                    {ercViolations.length === 0 ? (
                        <div className="erc-empty">
                            No violations found. Click "Run ERC" to check your schematic.
                        </div>
                    ) : (
                        <div className="erc-list">
                            {ercViolations.map((v) => (
                                <div
                                    key={v.id}
                                    className={`erc-item ${v.severity}`}
                                    onClick={() => handleViolationClick(v)}
                                >
                                    <span className="erc-item-icon">{severityIcon(v.severity)}</span>
                                    <span className="erc-item-severity">{v.severity.toUpperCase()}</span>
                                    <span className="erc-item-message">{v.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ErcPanel;
