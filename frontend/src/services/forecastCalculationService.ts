interface InventoryItem {
    sku: string;
    productName: string;
    currentStock: number;
    unitPrice: number;
    supplier: string;
    category: string;
    leadTime?: number;
    safetyStockLevel?: number;
}

interface SalesData {
    date: Date;
    quantity: number;
    sku: string;
}

interface ForecastResult {
    predictedDemand: number;
    recommendedOrder: number;
    stockoutRisk: number;
    priority: 'low' | 'medium' | 'high';
    confidenceLevel: number;
}

class ForecastCalculationService {
    private readonly DEMAND_MULTIPLIERS = {
        'Electronics': { base: 1.2, seasonal: 0.15 },
        'Accessories': { base: 0.8, seasonal: 0.1 },
        'Clothing': { base: 1.0, seasonal: 0.25 },
        'Home': { base: 0.9, seasonal: 0.2 }
    };

    private readonly LEAD_TIME_DEFAULTS = {
        'Electronics': 14,
        'Accessories': 7,
        'Clothing': 21,
        'Home': 10
    };

    /**
     * Generate realistic historical sales data for demo purposes
     */
    generateHistoricalData(sku: string, months: number = 6): SalesData[] {
        const data: SalesData[] = [];
        const baseQuantity = Math.floor(Math.random() * 100) + 50; // 50-150 base

        for (let i = months; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            // Add seasonal variation and random fluctuation
            const seasonalFactor = 1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
            const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
            const quantity = Math.floor(baseQuantity * seasonalFactor * randomFactor);

            data.push({
                date,
                quantity,
                sku
            });
        }

        return data;
    }

    /**
     * Calculate predicted demand using moving average with seasonal adjustment
     */
    calculatePredictedDemand(item: InventoryItem, historicalData: SalesData[]): number {
        if (historicalData.length === 0) {
            // Fallback calculation based on current stock and category
            const multiplier = this.DEMAND_MULTIPLIERS[item.category as keyof typeof this.DEMAND_MULTIPLIERS]?.base || 1.0;
            return Math.floor(item.currentStock * multiplier * (0.8 + Math.random() * 0.4));
        }

        // Calculate 3-month weighted moving average
        const recentData = historicalData.slice(-3);
        const weights = [0.5, 0.3, 0.2]; // More weight on recent data

        let weightedSum = 0;
        let totalWeight = 0;

        recentData.forEach((data, index) => {
            const weight = weights[index] || 0.1;
            weightedSum += data.quantity * weight;
            totalWeight += weight;
        });

        const baseAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Apply seasonal adjustment
        const currentMonth = new Date().getMonth();
        const seasonalFactor = 1 + 0.2 * Math.sin((currentMonth / 12) * 2 * Math.PI);

        // Apply category multiplier
        const categoryMultiplier = this.DEMAND_MULTIPLIERS[item.category as keyof typeof this.DEMAND_MULTIPLIERS]?.base || 1.0;

        return Math.floor(baseAverage * seasonalFactor * categoryMultiplier);
    }

    /**
     * Calculate recommended order quantity
     */
    calculateRecommendedOrder(item: InventoryItem, predictedDemand: number): number {
        const leadTime = item.leadTime || this.LEAD_TIME_DEFAULTS[item.category as keyof typeof this.LEAD_TIME_DEFAULTS] || 14;
        const safetyStock = item.safetyStockLevel || Math.floor(predictedDemand * 0.2); // 20% safety stock

        // Reorder point calculation: (Average demand × Lead time) + Safety stock
        const dailyDemand = predictedDemand / 30; // Convert monthly to daily
        const reorderPoint = (dailyDemand * leadTime) + safetyStock;

        // If current stock is below reorder point, calculate order quantity
        if (item.currentStock < reorderPoint) {
            const orderQuantity = Math.max(
                reorderPoint - item.currentStock + predictedDemand, // Cover reorder point + next month demand
                Math.floor(predictedDemand * 0.5) // Minimum 50% of predicted demand
            );
            return Math.floor(orderQuantity);
        }

        // If stock is sufficient, order smaller quantity or none
        return Math.floor(predictedDemand * 0.3 * Math.random()); // 0-30% of predicted demand
    }

    /**
     * Calculate stockout risk percentage
     */
    calculateStockoutRisk(item: InventoryItem, predictedDemand: number): number {
        const dailyDemand = predictedDemand / 30;
        const leadTime = item.leadTime || this.LEAD_TIME_DEFAULTS[item.category as keyof typeof this.LEAD_TIME_DEFAULTS] || 14;

        // Days of supply remaining
        const daysOfSupply = item.currentStock / dailyDemand;

        // Risk increases as we approach lead time
        let riskPercentage = 0;

        if (daysOfSupply <= leadTime) {
            // High risk if stock won't last through lead time
            riskPercentage = Math.min(95, 60 + (leadTime - daysOfSupply) * 5);
        } else if (daysOfSupply <= leadTime * 1.5) {
            // Medium risk
            riskPercentage = 30 + (leadTime * 1.5 - daysOfSupply) * 3;
        } else {
            // Low risk
            riskPercentage = Math.max(5, 30 - (daysOfSupply - leadTime * 1.5) * 2);
        }

        // Add some randomization for realism
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        riskPercentage *= randomFactor;

        return Math.min(95, Math.max(5, Math.floor(riskPercentage)));
    }

    /**
     * Determine priority based on risk and demand
     */
    calculatePriority(stockoutRisk: number, recommendedOrder: number): 'low' | 'medium' | 'high' {
        if (stockoutRisk >= 70 || recommendedOrder > 200) {
            return 'high';
        } else if (stockoutRisk >= 50 || recommendedOrder > 100) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Calculate confidence level based on data quality
     */
    calculateConfidenceLevel(historicalDataPoints: number): number {
        if (historicalDataPoints >= 6) return 95;
        if (historicalDataPoints >= 3) return 80;
        if (historicalDataPoints >= 1) return 65;
        return 50; // No historical data
    }

    /**
     * Generate complete forecast for an inventory item with enhanced demo scenarios
     */
    generateForecast(item: InventoryItem): ForecastResult {
        // Generate historical data for demo
        const historicalData = this.generateHistoricalData(item.sku);

        // Check if this is an enhanced item with scenario data
        const enhancedItem = item as any;
        const scenario = enhancedItem.scenario || 'stable';

        let predictedDemand = this.calculatePredictedDemand(item, historicalData);
        let stockoutRisk = this.calculateStockoutRisk(item, predictedDemand);

        // Apply scenario-specific adjustments for compelling demo
        switch (scenario) {
            case 'critical':
                // Critical items should show high demand and risk
                predictedDemand = Math.max(predictedDemand, item.currentStock * 2);
                stockoutRisk = Math.max(stockoutRisk, 75 + Math.random() * 20); // 75-95%
                break;
            case 'seasonal':
                // Seasonal items show surge patterns
                predictedDemand = Math.floor(predictedDemand * (2.0 + Math.random() * 1.5)); // 2-3.5x multiplier
                stockoutRisk = Math.max(stockoutRisk, 60 + Math.random() * 25); // 60-85%
                break;
            case 'high-demand':
                // High-demand items show consistent high volume
                predictedDemand = Math.floor(predictedDemand * (1.8 + Math.random() * 0.7)); // 1.8-2.5x multiplier
                stockoutRisk = Math.max(stockoutRisk, 50 + Math.random() * 30); // 50-80%
                break;
            case 'new-product':
                // New products have higher uncertainty
                predictedDemand = Math.floor(predictedDemand * (0.8 + Math.random() * 1.4)); // 0.8-2.2x multiplier (high variance)
                stockoutRisk = 40 + Math.random() * 40; // 40-80% (high uncertainty)
                break;
            case 'stable':
            default:
                // Stable items maintain normal patterns
                stockoutRisk = Math.min(stockoutRisk, 45); // Cap at 45% for stable items
                break;
        }

        const recommendedOrder = this.calculateRecommendedOrder(item, predictedDemand);
        const priority = this.calculatePriority(stockoutRisk, recommendedOrder);

        // Adjust confidence based on scenario
        let confidenceLevel = this.calculateConfidenceLevel(historicalData.length);
        if (scenario === 'new-product') {
            confidenceLevel = Math.min(confidenceLevel, 70); // Lower confidence for new products
        } else if (scenario === 'critical' || scenario === 'high-demand') {
            confidenceLevel = Math.min(95, confidenceLevel + 10); // Higher confidence for established patterns
        }

        return {
            predictedDemand: Math.floor(predictedDemand),
            recommendedOrder,
            stockoutRisk: Math.min(95, Math.max(5, Math.floor(stockoutRisk))),
            priority,
            confidenceLevel: Math.floor(confidenceLevel)
        };
    }
}

export const forecastCalculationService = new ForecastCalculationService();
export type { InventoryItem, SalesData, ForecastResult };