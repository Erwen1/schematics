/* ──────────────────────────────────────────────
   BOM Optimizer — Cost & Stock Analysis
   ────────────────────────────────────────────── */

import { SymbolInstance, DesignHint } from '../data/types';

interface MarketComponent {
    value: string;
    package: string;
    price: number;
    stock: number;
    alternative?: string;
}

const MOCK_MARKET: Record<string, MarketComponent[]> = {
    '10k': [
        { value: '10k', package: '0805', price: 0.001, stock: 100000 },
        { value: '10k', package: '0603', price: 0.0008, stock: 50000, alternative: '0603 is 20% cheaper' }
    ],
    '100nF': [
        { value: '100nF', package: '0805', price: 0.01, stock: 20000 },
        { value: '100nF', package: '0402', price: 0.005, stock: 10000, alternative: '0402 is 50% cheaper' }
    ]
};

/**
 * Analyzes BOM and suggests cost savings.
 */
export function optimizeBom(symbols: SymbolInstance[]): DesignHint[] {
    const hints: DesignHint[] = [];

    symbols.forEach(s => {
        const value = s.properties.value;
        const market = MOCK_MARKET[value];

        if (market) {
            const current = market[0];
            const better = market.find(m => m.price < current.price && m.stock > 0);

            if (better) {
                hints.push({
                    id: `bom_opt_${s.id}`,
                    severity: 'info',
                    category: 'bom',
                    message: `Cost saving for ${s.properties.reference}`,
                    description: `Switching to ${better.package} could save cost. ${better.alternative}`,
                    relatedIds: [s.id]
                });
            }
        }
    });

    return hints;
}
