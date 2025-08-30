export interface ChartDataPoint {
    date: Date;
    actualDemand: number;
    predictedDemand: number;
    sku: string;
    confidence?: number;
}

export interface TimeRange {
    label: string;
    value: '3M' | '6M';
    months: number;
}

export const timeRanges: TimeRange[] = [
    { label: '3 Months', value: '3M', months: 3 },
    { label: '6 Months', value: '6M', months: 6 }
];

class ChartDataService {
    /**
     * Generate realistic historical sales data with trends and seasonal variations
     */
    generateHistoricalData(sku: string, months: number): ChartDataPoint[] {
        const data: ChartDataPoint[] = [];
        const now = new Date();

        // Base demand varies by product category
        const baseDemand = this.getBaseDemandForSku(sku);

        // Generate data points for each week over the specified months
        const totalWeeks = months * 4;

        for (let i = totalWeeks; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7)); // Go back i weeks

            // Create realistic demand with trends and seasonality
            const weekOfYear = this.getWeekOfYear(date);
            const seasonalFactor = this.getSeasonalFactor(sku, weekOfYear);
            const trendFactor = this.getTrendFactor(i, totalWeeks);
            const randomVariation = 0.8 + (Math.random() * 0.4); // ±20% random variation

            const actualDemand = Math.round(baseDemand * seasonalFactor * trendFactor * randomVariation);

            // Predicted demand should be close to actual but with some variance
            const predictionAccuracy = 0.85 + (Math.random() * 0.15); // 85-100% accuracy
            const predictedDemand = Math.round(actualDemand * predictionAccuracy);

            // Confidence level based on how recent the data is (more recent = higher confidence)
            const confidence = Math.min(95, 70 + (30 * (1 - i / totalWeeks)));

            data.push({
                date,
                actualDemand,
                predictedDemand,
                sku,
                confidence: Math.round(confidence)
            });
        }

        return data;
    }

    /**
     * Get base demand for different product SKUs with enhanced demo scenarios
     */
    private getBaseDemandForSku(sku: string): number {
        const baseDemands: { [key: string]: number } = {
            // Original products
            'WH-001': 45, 'SM-002': 25, 'TB-003': 35, 'LP-004': 60, 'PH-005': 80, 'CH-006': 70,

            // Enhanced demo products
            'WH-PRO-001': 85,    // Premium headphones - high demand
            'SM-ULTRA-002': 40,  // Ultra smartwatch - premium segment
            'TB-PARTY-003': 120, // Party speakers - seasonal surges
            'WB-WINTER-004': 95, // Winter earbuds - seasonal
            'CH-FAST-005': 200,  // Fast-charge cables - very high demand
            'PH-TREND-006': 300, // Trending phone cases - viral demand
            'AR-NEW-007': 15,    // AR glasses - new product uncertainty
            'FT-BETA-008': 25,   // AI fitness tracker - new product
            'LP-STEADY-009': 50, // Laptop stand - stable demand
            'MW-OFFICE-010': 60, // Mouse & keyboard - stable demand

            // Critical/seasonal/high-demand scenarios
            'CRIT-001': 90,      // Gaming headset - critical stock
            'CRIT-002': 150,     // Wireless charger - critical stock
            'SEAS-001': 180,     // Summer speakers - seasonal
            'SEAS-002': 110,     // Holiday bundles - seasonal
            'HIGH-001': 400,     // Viral phone grip - extremely high demand
            'HIGH-002': 180,     // Influencer earbuds - high demand
            'NEW-001': 8,        // VR headset - very new, uncertain
            'NEW-002': 20        // Smart ring - new product
        };

        return baseDemands[sku] || 40;
    }

    /**
     * Apply seasonal factors based on product category and time of year with enhanced demo scenarios
     */
    private getSeasonalFactor(sku: string, weekOfYear: number): number {
        // Enhanced seasonal patterns for compelling demo scenarios
        const seasonalPatterns: { [key: string]: (week: number) => number } = {
            // Critical scenarios - show recent surge
            'WH-PRO-001': (week) => {
                if (week >= 45 || week <= 5) return 2.2; // Massive holiday surge
                if (week >= 30 && week <= 35) return 1.8; // Back to school
                return 1.2;
            },
            'SM-ULTRA-002': (week) => {
                if (week >= 1 && week <= 8) return 2.5; // New Year fitness craze
                if (week >= 45 || week <= 2) return 2.0; // Holiday gifts
                return 1.0;
            },

            // Seasonal scenarios - dramatic seasonal patterns
            'TB-PARTY-003': (week) => {
                if (week >= 15 && week <= 35) return 3.5; // Summer party season explosion
                if (week >= 45 || week <= 5) return 2.0; // Holiday parties
                return 0.6; // Very low off-season
            },
            'WB-WINTER-004': (week) => {
                if (week >= 45 || week <= 5) return 2.8; // Holiday gift season
                if (week >= 1 && week <= 8) return 1.8; // New Year fitness
                return 0.9;
            },

            // High-demand scenarios - consistent high with spikes
            'CH-FAST-005': (week) => {
                if (week >= 35 && week <= 40) return 1.8; // New device launches
                if (week >= 45 || week <= 5) return 1.6; // Holiday season
                return 1.3; // Consistently high base
            },
            'PH-TREND-006': (week) => {
                // Viral trend - recent massive spike
                if (week >= 8 && week <= 16) return 4.0; // Viral trend peak
                if (week >= 4 && week <= 20) return 2.5; // Extended viral period
                return 1.0;
            },

            // New product scenarios - uncertain patterns
            'AR-NEW-007': (week) => {
                // New product with growing adoption
                const growthFactor = Math.min(2.0, 0.5 + (week / 26)); // Gradual growth
                return growthFactor * (0.8 + Math.random() * 0.4); // High uncertainty
            },
            'FT-BETA-008': (week) => {
                if (week >= 1 && week <= 8) return 1.8; // Fitness season boost
                return 1.0 + (Math.random() * 0.6 - 0.3); // ±30% uncertainty
            },

            // Stable scenarios - predictable patterns
            'LP-STEADY-009': (week) => {
                if (week >= 30 && week <= 35) return 1.3; // Back to school
                if (week >= 1 && week <= 4) return 1.2; // New Year work setup
                return 1.0;
            },
            'MW-OFFICE-010': (week) => {
                if (week >= 30 && week <= 35) return 1.2; // Back to school/work
                return 1.0; // Very stable
            },

            // Legacy products (maintain original patterns)
            'WH-001': (week) => {
                if (week >= 45 || week <= 5) return 1.4;
                if (week >= 30 && week <= 35) return 1.2;
                return 1.0;
            },
            'SM-002': (week) => {
                if (week >= 1 && week <= 8) return 1.3;
                if (week >= 45 || week <= 2) return 1.5;
                return 0.9;
            },
            'TB-003': (week) => {
                if (week >= 20 && week <= 35) return 1.3;
                if (week >= 45 || week <= 5) return 1.4;
                return 0.8;
            },
            'LP-004': (week) => {
                if (week >= 30 && week <= 35) return 1.2;
                return 1.0;
            },
            'PH-005': (week) => {
                if (week >= 35 && week <= 40) return 1.3;
                return 1.0;
            },
            'CH-006': (week) => 1.0
        };

        const pattern = seasonalPatterns[sku];
        return pattern ? pattern(weekOfYear) : 1.0;
    }

    /**
     * Apply trend factor (growth/decline over time)
     */
    private getTrendFactor(weeksAgo: number, totalWeeks: number): number {
        // Most electronics show slight growth over time
        const growthRate = 0.02; // 2% growth over the period
        const progress = 1 - (weeksAgo / totalWeeks); // 0 to 1, where 1 is most recent
        return 1 + (growthRate * progress);
    }

    /**
     * Get week number of the year (1-52)
     */
    private getWeekOfYear(date: Date): number {
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - start.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek) + 1;
    }

    /**
     * Filter data by time range
     */
    filterDataByTimeRange(data: ChartDataPoint[], timeRange: '3M' | '6M'): ChartDataPoint[] {
        const months = timeRange === '3M' ? 3 : 6;
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);

        return data.filter(point => point.date >= cutoffDate);
    }

    /**
     * Get available products for chart selection with enhanced demo scenarios
     */
    getAvailableProducts(): { sku: string; name: string }[] {
        return [
            // Critical scenarios
            { sku: 'WH-PRO-001', name: 'Premium Noise-Canceling Headphones' },
            { sku: 'SM-ULTRA-002', name: 'Ultra Fitness Smartwatch' },

            // Seasonal scenarios
            { sku: 'TB-PARTY-003', name: 'Portable Party Speakers' },
            { sku: 'WB-WINTER-004', name: 'Wireless Earbuds Pro' },

            // High-demand scenarios
            { sku: 'CH-FAST-005', name: 'Fast-Charge USB-C Cables' },
            { sku: 'PH-TREND-006', name: 'Trending Phone Cases Collection' },

            // New product scenarios
            { sku: 'AR-NEW-007', name: 'AR Gaming Glasses' },
            { sku: 'FT-BETA-008', name: 'AI Fitness Tracker' },

            // Stable scenarios
            { sku: 'LP-STEADY-009', name: 'Laptop Stand & Hub Combo' },
            { sku: 'MW-OFFICE-010', name: 'Wireless Mouse & Keyboard Set' }
        ];
    }
}

export const chartDataService = new ChartDataService();