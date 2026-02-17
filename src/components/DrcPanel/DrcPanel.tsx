/* ──────────────────────────────────────────────
   DrcPanel — PCB Design Rule Check Results
   ────────────────────────────────────────────── */

import React from 'react';
import { usePcbStore } from '../../store/pcbStore';
import { useSchematicStore } from '../../store/schematicStore';

export const DrcPanel: React.FC = () => {
    const { violations, runDrc } = usePcbStore();
    const { nets, netClasses } = useSchematicStore();

    return (
        <div className="drc-panel">
            <div className="panel-header">
                <h3>DRC Violations ({violations.length})</h3>
                <button
                    className="run-drc-btn"
                    onClick={() => runDrc(nets, netClasses)}
                >
                    Run DRC
                </button>
            </div>
            <div className="violation-list">
                {violations.length === 0 ? (
                    <div className="no-violations">No board violations found.</div>
                ) : (
                    violations.map(v => (
                        <div key={v.id} className={`violation-item ${v.severity}`}>
                            <span className="violation-icon">
                                {v.severity === 'error' ? '❌' : '⚠️'}
                            </span>
                            <span className="violation-message">{v.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
