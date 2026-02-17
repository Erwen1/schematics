/* ──────────────────────────────────────────────
   ContextMenu — Right-click context menu
   ────────────────────────────────────────────── */

import React, { useEffect, useRef } from 'react';
import { useSchematicStore } from '../../store/schematicStore';

const ContextMenu: React.FC = () => {
    const contextMenu = useSchematicStore((s) => s.contextMenu);
    const selectedIds = useSchematicStore((s) => s.selectedIds);
    const closeContextMenu = useSchematicStore((s) => s.closeContextMenu);
    const rotateSelected = useSchematicStore((s) => s.rotateSelected);
    const flipSelected = useSchematicStore((s) => s.flipSelected);
    const deleteSelected = useSchematicStore((s) => s.deleteSelected);
    const duplicateSelected = useSchematicStore((s) => s.duplicateSelected);
    const autoAnnotate = useSchematicStore((s) => s.autoAnnotate);
    const addJunction = useSchematicStore((s) => s.addJunction);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeContextMenu();
            }
        };
        if (contextMenu) {
            document.addEventListener('mousedown', handler);
        }
        return () => document.removeEventListener('mousedown', handler);
    }, [contextMenu, closeContextMenu]);

    if (!contextMenu) return null;

    const hasSelection = selectedIds.length > 0;

    const items: { label: string; icon: string; action: () => void; disabled?: boolean; separator?: boolean }[] = [
        { label: 'Rotate 90°', icon: '↻', action: () => { rotateSelected(); closeContextMenu(); }, disabled: !hasSelection },
        { label: 'Flip', icon: '⇅', action: () => { flipSelected(); closeContextMenu(); }, disabled: !hasSelection },
        { label: 'Duplicate', icon: '❐', action: () => { duplicateSelected(); closeContextMenu(); }, disabled: !hasSelection },
        { label: 'Delete', icon: '🗑', action: () => { deleteSelected(); closeContextMenu(); }, disabled: !hasSelection },
        { label: '', icon: '', action: () => { }, separator: true },
        { label: 'Add Junction', icon: '⊕', action: () => { addJunction(contextMenu.canvasX, contextMenu.canvasY); closeContextMenu(); } },
        { label: 'Auto Annotate', icon: '🏷', action: () => { autoAnnotate(); closeContextMenu(); } },
    ];

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 9999,
            }}
        >
            {items.map((item, i) =>
                item.separator ? (
                    <div key={i} className="context-menu-separator" />
                ) : (
                    <button
                        key={i}
                        className="context-menu-item"
                        disabled={item.disabled}
                        onClick={item.action}
                    >
                        <span className="context-menu-icon">{item.icon}</span>
                        {item.label}
                    </button>
                )
            )}
        </div>
    );
};

export default ContextMenu;
