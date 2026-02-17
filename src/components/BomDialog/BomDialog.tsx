/* ──────────────────────────────────────────────
   BomDialog — Bill of Materials modal
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useSchematicStore, BomEntry } from '../../store/schematicStore';

interface BomDialogProps {
    open: boolean;
    onClose: () => void;
}

const BomDialog: React.FC<BomDialogProps> = ({ open, onClose }) => {
    const exportBom = useSchematicStore((s) => s.exportBom);
    const [bomData, setBomData] = useState<BomEntry[]>([]);

    React.useEffect(() => {
        if (open) {
            setBomData(exportBom());
        }
    }, [open, exportBom]);

    if (!open) return null;

    const downloadCsv = () => {
        const header = 'Reference,Value,Footprint,Quantity\n';
        const rows = bomData.map((b) => `"${b.reference}","${b.value}","${b.footprint}",${b.quantity}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bom.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(bomData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bom.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bom-overlay" onClick={onClose}>
            <div className="bom-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="bom-header">
                    <h2>📋 Bill of Materials</h2>
                    <button className="bom-close" onClick={onClose}>✕</button>
                </div>

                <div className="bom-table-wrap">
                    <table className="bom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Reference</th>
                                <th>Value</th>
                                <th>Footprint</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bomData.map((entry, i) => (
                                <tr key={i}>
                                    <td className="bom-row-num">{i + 1}</td>
                                    <td className="bom-ref">{entry.reference}</td>
                                    <td>{entry.value}</td>
                                    <td className="bom-footprint">{entry.footprint || '—'}</td>
                                    <td className="bom-qty">{entry.quantity}</td>
                                </tr>
                            ))}
                            {bomData.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', opacity: 0.5, padding: '24px' }}>
                                        No components placed
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bom-footer">
                    <span className="bom-count">{bomData.length} unique parts • {bomData.reduce((a, b) => a + b.quantity, 0)} total</span>
                    <div className="bom-actions">
                        <button className="bom-btn" onClick={downloadCsv}>📥 CSV</button>
                        <button className="bom-btn" onClick={downloadJson}>📥 JSON</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BomDialog;
