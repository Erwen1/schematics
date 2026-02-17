/* ──────────────────────────────────────────────
   AI PCB Engine — Smart Placement & Optimization
   ────────────────────────────────────────────── */

import { FootprintInstance, PcbTrace, PcbProject, SymbolInstance, Wire, Net } from '../data/types';
import { RatsnestLine } from './ratsnest';
import { v4 as uuid } from 'uuid';

/**
 * Force-Directed Auto-placement
 * Minimizes total ratsnest length by treating connections as springs.
 */
export function autoPlaceFootprints(
    footprints: FootprintInstance[],
    ratsnest: RatsnestLine[]
): FootprintInstance[] {
    const K = 0.1; // Spring constant
    const friction = 0.9;
    const iterations = 100;

    let currentFootprints = [...footprints.map(f => ({ ...f, vx: 0, vy: 0 }))];

    for (let i = 0; i < iterations; i++) {
        currentFootprints = currentFootprints.map(f => {
            let fx = 0;
            let fy = 0;

            // Attraction forces (from ratsnest)
            const connections = ratsnest.filter(r =>
                r.from.componentId === f.id || r.to.componentId === f.id
            );

            connections.forEach(rel => {
                const other = currentFootprints.find(cf =>
                    cf.id !== f.id && (rel.from.componentId === cf.id || rel.to.componentId === cf.id)
                );
                if (other) {
                    fx += (other.x - f.x) * K;
                    fy += (other.y - f.y) * K;
                }
            });

            // Repulsion forces (to avoid overlap)
            currentFootprints.forEach(other => {
                if (other.id === f.id) return;
                const distSq = Math.pow(other.x - f.x, 2) + Math.pow(other.y - f.y, 2);
                const safeDist = 20; // mm
                if (distSq < safeDist * safeDist) {
                    const dist = Math.sqrt(distSq) || 1;
                    fx -= (other.x - f.x) / distSq * 50;
                    fy -= (other.y - f.y) / distSq * 50;
                }
            });

            const vx = (f.vx + fx) * friction;
            const vy = (f.vy + fy) * friction;

            return {
                ...f,
                vx, vy,
                x: f.x + vx,
                y: f.y + vy
            };
        });
    }

    return currentFootprints;
}

/**
 * Iterative DRC Auto-fixer — "The Nudger"
 * Nudges components to resolve clearance violations.
 */
export function autoFixConstraints(project: PcbProject): PcbProject {
    const iterations = 10;
    const nudgeStep = 1.0; // 1mm nudge
    const clearance = 2.0; // mm

    let currentFootprints = [...project.footprints.map(f => ({ ...f }))];

    for (let i = 0; i < iterations; i++) {
        let movedCount = 0;
        currentFootprints = currentFootprints.map((f, idx) => {
            let dx = 0;
            let dy = 0;

            for (let j = 0; j < currentFootprints.length; j++) {
                if (idx === j) continue;
                const other = currentFootprints[j];

                const distSq = Math.pow(other.x - f.x, 2) + Math.pow(other.y - f.y, 2);
                const safeDist = clearance + 10; // Simple bounding box approximation

                if (distSq < safeDist * safeDist) {
                    const dist = Math.sqrt(distSq) || 1;
                    // Push away from 'other'
                    dx -= (other.x - f.x) / dist * nudgeStep;
                    dy -= (other.y - f.y) / dist * nudgeStep;
                    movedCount++;
                }
            }

            return {
                ...f,
                x: f.x + dx,
                y: f.y + dy
            };
        });

        if (movedCount === 0) break; // Settled
    }

    return { ...project, footprints: currentFootprints };
}
