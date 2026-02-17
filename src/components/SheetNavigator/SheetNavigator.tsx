/* ──────────────────────────────────────────────
   Sheet Navigator — Tab bar for hierarchical sheet navigation
   ────────────────────────────────────────────── */

import React from 'react';
import { useSchematicStore } from '../../store/schematicStore';

export const SheetNavigator: React.FC = () => {
    const sheetStack = useSchematicStore((s) => s.sheetStack);
    const sheetDefs = useSchematicStore((s) => s.sheetDefs);
    const activeSheetId = useSchematicStore((s) => s.activeSheetId);
    const closeSheet = useSchematicStore((s) => s.closeSheet);

    if (sheetStack.length === 0) return null;

    // Build breadcrumb path
    const crumbs: { label: string; id: string | null }[] = [
        { label: '🏠 Root', id: null },
    ];

    for (const sheetId of sheetStack) {
        const def = sheetDefs.find((sd) => sd.id === sheetId);
        crumbs.push({
            label: def?.name || 'Sheet',
            id: sheetId,
        });
    }

    return (
        <div className="sheet-navigator">
            {crumbs.map((crumb, i) => {
                const isActive = crumb.id === activeSheetId;
                const isLast = i === crumbs.length - 1;

                return (
                    <React.Fragment key={crumb.id || 'root'}>
                        <button
                            className={`sheet-nav-tab ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                // Navigate back to this level by closing sheets
                                const targetIdx = sheetStack.indexOf(crumb.id || '');
                                if (crumb.id === null) {
                                    // Close all sheets to return to root
                                    for (let j = 0; j < sheetStack.length; j++) closeSheet();
                                } else {
                                    // Close sheets until we reach the target
                                    const closeTimes = sheetStack.length - targetIdx - 1;
                                    for (let j = 0; j < closeTimes; j++) closeSheet();
                                }
                            }}
                        >
                            {crumb.label}
                        </button>
                        {!isLast && <span className="sheet-nav-separator">›</span>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
