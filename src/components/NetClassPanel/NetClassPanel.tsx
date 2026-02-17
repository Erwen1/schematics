/* ──────────────────────────────────────────────
   Net Class Panel — Manage net classes and assign constraints
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useSchematicStore } from '../../store/schematicStore';

export const NetClassPanel: React.FC = () => {
    const netClasses = useSchematicStore((s) => s.netClasses);
    const nets = useSchematicStore((s) => s.nets);
    const addNetClass = useSchematicStore((s) => s.addNetClass);
    const updateNetClass = useSchematicStore((s) => s.updateNetClass);
    const removeNetClass = useSchematicStore((s) => s.removeNetClass);
    const autoAssign = useSchematicStore((s) => s.autoAssignNetClasses);

    const [expanded, setExpanded] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const getNetCountForClass = (classId: string) =>
        nets.filter((n) => n.netClassId === classId).length;

    return (
        <div className="netclass-panel">
            <div className="panel-header">
                <h3>Net Classes</h3>
            </div>

            <div className="netclass-actions">
                <button className="netclass-auto-btn" onClick={autoAssign} title="Auto-assign net classes">
                    ⚡ Auto-Assign
                </button>
            </div>

            <div className="netclass-list">
                {netClasses.map((nc) => {
                    const isExpanded = expanded === nc.id;
                    const netCount = getNetCountForClass(nc.id);

                    return (
                        <div key={nc.id} className={`netclass-item ${isExpanded ? 'expanded' : ''}`}>
                            <div
                                className="netclass-header"
                                onClick={() => setExpanded(isExpanded ? null : nc.id)}
                            >
                                <span
                                    className="netclass-color-dot"
                                    style={{ background: nc.color }}
                                />
                                <span className="netclass-name">{nc.name}</span>
                                <span className="netclass-count">{netCount}</span>
                                <span className="netclass-chevron">{isExpanded ? '▾' : '▸'}</span>
                            </div>

                            {isExpanded && (
                                <div className="netclass-details">
                                    <p className="netclass-desc">{nc.description}</p>

                                    <div className="netclass-constraints">
                                        <div className="netclass-constraint-row">
                                            <span>Clearance</span>
                                            <input
                                                type="number"
                                                className="prop-input"
                                                value={nc.constraints.clearance || 0}
                                                onChange={(e) =>
                                                    updateNetClass(nc.id, {
                                                        constraints: {
                                                            ...nc.constraints,
                                                            clearance: parseInt(e.target.value) || 0,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="netclass-unit">mil</span>
                                        </div>
                                        <div className="netclass-constraint-row">
                                            <span>Trace Width</span>
                                            <input
                                                type="number"
                                                className="prop-input"
                                                value={nc.constraints.traceWidth || 0}
                                                onChange={(e) =>
                                                    updateNetClass(nc.id, {
                                                        constraints: {
                                                            ...nc.constraints,
                                                            traceWidth: parseInt(e.target.value) || 0,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="netclass-unit">mil</span>
                                        </div>
                                        <div className="netclass-constraint-row">
                                            <span>Via Size</span>
                                            <input
                                                type="number"
                                                className="prop-input"
                                                value={nc.constraints.viaSize || 0}
                                                onChange={(e) =>
                                                    updateNetClass(nc.id, {
                                                        constraints: {
                                                            ...nc.constraints,
                                                            viaSize: parseInt(e.target.value) || 0,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="netclass-unit">mil</span>
                                        </div>
                                    </div>

                                    <div className="netclass-patterns">
                                        <span className="netclass-patterns-label">Patterns:</span>
                                        <span className="netclass-patterns-list">
                                            {nc.patterns.length > 0 ? nc.patterns.join(', ') : 'none'}
                                        </span>
                                    </div>

                                    {nc.id !== 'nc_default' && (
                                        <button
                                            className="netclass-delete-btn"
                                            onClick={() => removeNetClass(nc.id)}
                                        >
                                            🗑 Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add new net class */}
            <div className="netclass-add">
                <input
                    type="text"
                    className="prop-input"
                    placeholder="New class name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && newName.trim()) {
                            addNetClass(newName.trim(), '', '#88aacc');
                            setNewName('');
                        }
                    }}
                />
                <button
                    className="netclass-add-btn"
                    disabled={!newName.trim()}
                    onClick={() => {
                        if (newName.trim()) {
                            addNetClass(newName.trim(), '', '#88aacc');
                            setNewName('');
                        }
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
};
