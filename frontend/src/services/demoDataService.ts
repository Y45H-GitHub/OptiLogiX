import { InventoryItem } from './forecastCalculationService';

export interface DemoScenario {
    name: string;
    description: string;
    items: InventoryItem[];
}

export interface EnhancedInventoryItem extends InventoryItem {
    scenario: 'critical' | 'seasonal' | 'high-demand' | 'stable' | 'new-product';
    storyContext: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: string;
}

class DemoDataService {
    /**
     * Generate compelling demo scenarios for hackathon presentation
     */
    generateDemoScenarios(): DemoScenario[] {
        return [
            {
                name: 'Critical Stock Alert',
                description: 'Products with dangerously low inventory requiring immediate action',
                items: this.getCriticalStockItems()
            },
            {
                name: 'Seasonal Surge',
                description: 'Items experiencing seasonal demand spikes',
                items: this.getSeasonalItems()
            },
            {
                name: 'High-Demand Products',
                description: 'Fast-moving inventory with consistent high demand',
                items: this.getHighDemandItems()
            },
            {
                name: 'New Product Launch',
                description: 'Recently launched products with uncertain demand patterns',
                items: this.getNewProductItems()
            }
        ];
    }

    /**
     * Get enhanced inventory data with compelling stories
     */
    getEnhancedInventoryData(): EnhancedInventoryItem[] {
        return [
            // Critical Stock Items
            {
                sku: 'WH-PRO-001',
                productName: 'Premium Noise-Canceling Headphones',
                currentStock: 8, // Critically low
                unitPrice: 299.99,
                supplier: 'AudioTech Premium',
                category: 'Electronics',
                leadTime: 21, // Long lead time makes it more critical
                safetyStockLevel: 25,
                scenario: 'critical',
                storyContext: 'Best-selling premium headphones with only 8 units left. Major retailer just placed order for 50 units.',
                urgencyLevel: 'critical',
                businessImpact: 'Risk of losing $15K+ in sales and damaging key retailer relationship'
            },
            {
                sku: 'SM-ULTRA-002',
                productName: 'Ultra Fitness Smartwatch',
                currentStock: 12, // Low stock
                unitPrice: 449.99,
                supplier: 'WearableTech Elite',
                category: 'Electronics',
                leadTime: 28, // Very long lead time
                safetyStockLevel: 30,
                scenario: 'critical',
                storyContext: 'New Year fitness rush depleted inventory. Supplier has 4-week lead time due to chip shortage.',
                urgencyLevel: 'critical',
                businessImpact: 'Missing peak fitness season could cost $50K+ in Q1 revenue'
            },

            // Seasonal Items
            {
                sku: 'TB-PARTY-003',
                productName: 'Portable Party Speakers',
                currentStock: 45,
                unitPrice: 159.99,
                supplier: 'SoundWave Pro',
                category: 'Electronics',
                leadTime: 14,
                safetyStockLevel: 40,
                scenario: 'seasonal',
                storyContext: 'Summer party season approaching. Historical data shows 300% demand increase in May-August.',
                urgencyLevel: 'high',
                businessImpact: 'Summer represents 60% of annual speaker sales - critical to stock up now'
            },
            {
                sku: 'WB-WINTER-004',
                productName: 'Wireless Earbuds Pro',
                currentStock: 85,
                unitPrice: 199.99,
                supplier: 'AudioMax Solutions',
                category: 'Electronics',
                leadTime: 16,
                safetyStockLevel: 50,
                scenario: 'seasonal',
                storyContext: 'Holiday gift season inventory. Last year sold 400+ units in Nov-Dec period.',
                urgencyLevel: 'medium',
                businessImpact: 'Holiday season accounts for 40% of annual earbud revenue'
            },

            // High-Demand Products
            {
                sku: 'CH-FAST-005',
                productName: 'Fast-Charge USB-C Cables',
                currentStock: 150,
                unitPrice: 24.99,
                supplier: 'CableTech Direct',
                category: 'Accessories',
                leadTime: 7,
                safetyStockLevel: 100,
                scenario: 'high-demand',
                storyContext: 'Fastest-moving accessory. Sells 200+ units monthly with growing demand from new device launches.',
                urgencyLevel: 'medium',
                businessImpact: 'Consistent revenue generator - stockouts directly impact monthly targets'
            },
            {
                sku: 'PH-TREND-006',
                productName: 'Trending Phone Cases Collection',
                currentStock: 220,
                unitPrice: 29.99,
                supplier: 'MobileStyle Co.',
                category: 'Accessories',
                leadTime: 10,
                safetyStockLevel: 150,
                scenario: 'high-demand',
                storyContext: 'Viral social media trend driving unprecedented demand. Influencer partnerships boosting sales 400%.',
                urgencyLevel: 'high',
                businessImpact: 'Trending products have short lifecycle - must capitalize while demand is hot'
            },

            // New Product Items
            {
                sku: 'AR-NEW-007',
                productName: 'AR Gaming Glasses',
                currentStock: 35,
                unitPrice: 599.99,
                supplier: 'FutureTech Innovations',
                category: 'Electronics',
                leadTime: 35, // Long lead time for new tech
                safetyStockLevel: 20,
                scenario: 'new-product',
                storyContext: 'Revolutionary AR glasses launched 2 months ago. Early reviews excellent but demand unpredictable.',
                urgencyLevel: 'medium',
                businessImpact: 'First-mover advantage in AR market - success could establish new product category'
            },
            {
                sku: 'FT-BETA-008',
                productName: 'AI Fitness Tracker',
                currentStock: 60,
                unitPrice: 179.99,
                supplier: 'HealthTech Pioneers',
                category: 'Electronics',
                leadTime: 21,
                safetyStockLevel: 25,
                scenario: 'new-product',
                storyContext: 'AI-powered fitness tracker with personalized coaching. Beta testing showed 95% user satisfaction.',
                urgencyLevel: 'medium',
                businessImpact: 'Potential breakthrough product - early inventory positioning crucial for market capture'
            },

            // Stable Products
            {
                sku: 'LP-STEADY-009',
                productName: 'Laptop Stand & Hub Combo',
                currentStock: 120,
                unitPrice: 89.99,
                supplier: 'WorkSpace Solutions',
                category: 'Accessories',
                leadTime: 12,
                safetyStockLevel: 60,
                scenario: 'stable',
                storyContext: 'Reliable work-from-home essential. Steady demand with predictable seasonal patterns.',
                urgencyLevel: 'low',
                businessImpact: 'Consistent performer - maintains steady revenue stream with minimal risk'
            },
            {
                sku: 'MW-OFFICE-010',
                productName: 'Wireless Mouse & Keyboard Set',
                currentStock: 95,
                unitPrice: 79.99,
                supplier: 'PeripheralPro Ltd.',
                category: 'Accessories',
                leadTime: 8,
                safetyStockLevel: 45,
                scenario: 'stable',
                storyContext: 'Corporate bulk orders and individual sales. Predictable replacement cycle every 18-24 months.',
                urgencyLevel: 'low',
                businessImpact: 'Bread-and-butter product with reliable margins and customer loyalty'
            }
        ];
    }

    /**
     * Get items with critical stock levels for urgent demonstration
     */
    private getCriticalStockItems(): InventoryItem[] {
        return [
            {
                sku: 'CRIT-001',
                productName: 'Emergency Stock Alert - Gaming Headset',
                currentStock: 3, // Extremely critical
                unitPrice: 199.99,
                supplier: 'GameAudio Pro',
                category: 'Electronics',
                leadTime: 21,
                safetyStockLevel: 25
            },
            {
                sku: 'CRIT-002',
                productName: 'Last Units - Wireless Charger',
                currentStock: 7,
                unitPrice: 49.99,
                supplier: 'ChargeTech Inc.',
                category: 'Accessories',
                leadTime: 14,
                safetyStockLevel: 20
            }
        ];
    }

    /**
     * Get seasonal items with compelling timing stories
     */
    private getSeasonalItems(): InventoryItem[] {
        return [
            {
                sku: 'SEAS-001',
                productName: 'Summer Outdoor Speakers',
                currentStock: 40,
                unitPrice: 129.99,
                supplier: 'OutdoorSound Co.',
                category: 'Electronics',
                leadTime: 18,
                safetyStockLevel: 35
            },
            {
                sku: 'SEAS-002',
                productName: 'Holiday Gift Bundles',
                currentStock: 65,
                unitPrice: 89.99,
                supplier: 'GiftTech Solutions',
                category: 'Accessories',
                leadTime: 12,
                safetyStockLevel: 50
            }
        ];
    }

    /**
     * Get high-demand items showing growth trends
     */
    private getHighDemandItems(): InventoryItem[] {
        return [
            {
                sku: 'HIGH-001',
                productName: 'Viral TikTok Phone Grip',
                currentStock: 180,
                unitPrice: 19.99,
                supplier: 'TrendyTech Co.',
                category: 'Accessories',
                leadTime: 5,
                safetyStockLevel: 100
            },
            {
                sku: 'HIGH-002',
                productName: 'Influencer-Endorsed Earbuds',
                currentStock: 90,
                unitPrice: 149.99,
                supplier: 'SocialSound Inc.',
                category: 'Electronics',
                leadTime: 10,
                safetyStockLevel: 60
            }
        ];
    }

    /**
     * Get new product items with uncertainty factors
     */
    private getNewProductItems(): InventoryItem[] {
        return [
            {
                sku: 'NEW-001',
                productName: 'Next-Gen VR Headset',
                currentStock: 25,
                unitPrice: 799.99,
                supplier: 'VirtualTech Innovations',
                category: 'Electronics',
                leadTime: 42, // Long lead time for cutting-edge tech
                safetyStockLevel: 15
            },
            {
                sku: 'NEW-002',
                productName: 'AI-Powered Smart Ring',
                currentStock: 50,
                unitPrice: 299.99,
                supplier: 'WearableAI Corp.',
                category: 'Electronics',
                leadTime: 28,
                safetyStockLevel: 20
            }
        ];
    }

    /**
     * Generate realistic demand patterns for demo scenarios
     */
    generateScenarioDemandPatterns(scenario: string): {
        demandMultiplier: number;
        volatility: number;
        trendDirection: 'up' | 'down' | 'stable';
        seasonalPeak: boolean;
    } {
        const patterns = {
            'critical': {
                demandMultiplier: 1.8, // High demand causing stockout
                volatility: 0.4, // High volatility
                trendDirection: 'up' as const,
                seasonalPeak: false
            },
            'seasonal': {
                demandMultiplier: 2.5, // Seasonal surge
                volatility: 0.6, // Very high volatility
                trendDirection: 'up' as const,
                seasonalPeak: true
            },
            'high-demand': {
                demandMultiplier: 2.0, // Consistently high
                volatility: 0.3, // Moderate volatility
                trendDirection: 'up' as const,
                seasonalPeak: false
            },
            'new-product': {
                demandMultiplier: 1.2, // Uncertain demand
                volatility: 0.8, // Very high volatility due to uncertainty
                trendDirection: 'stable' as const,
                seasonalPeak: false
            },
            'stable': {
                demandMultiplier: 1.0, // Normal demand
                volatility: 0.2, // Low volatility
                trendDirection: 'stable' as const,
                seasonalPeak: false
            }
        };

        return patterns[scenario as keyof typeof patterns] || patterns.stable;
    }

    /**
     * Get demo presentation script with key talking points
     */
    getDemoPresentationScript(): {
        phase: string;
        title: string;
        description: string;
        keyPoints: string[];
        demoActions: string[];
    }[] {
        return [
            {
                phase: 'opening',
                title: 'AI-Powered Supply Chain Intelligence',
                description: 'Showcase the intelligent dashboard with real-time insights',
                keyPoints: [
                    'Real-time inventory monitoring across 10+ product categories',
                    'AI-driven demand forecasting with 85%+ accuracy',
                    'Automated risk assessment and priority scoring',
                    'Dynamic KPI tracking with instant updates'
                ],
                demoActions: [
                    'Highlight critical stock alerts (red indicators)',
                    'Show total forecast value and risk metrics',
                    'Point out confidence levels and prediction accuracy'
                ]
            },
            {
                phase: 'problem-identification',
                title: 'Critical Stock Situations',
                description: 'Demonstrate how AI identifies urgent inventory needs',
                keyPoints: [
                    'Premium headphones: Only 8 units left, 21-day lead time',
                    'Fitness watches: New Year demand surge, supplier delays',
                    'Automated risk calculation shows 85%+ stockout probability',
                    'Business impact: $50K+ revenue at risk'
                ],
                demoActions: [
                    'Click on critical items to show detailed analysis',
                    'Highlight stockout risk percentages',
                    'Show business impact calculations'
                ]
            },
            {
                phase: 'seasonal-intelligence',
                title: 'Seasonal Demand Forecasting',
                description: 'Show how AI predicts seasonal trends and opportunities',
                keyPoints: [
                    'Summer speaker demand: 300% historical increase expected',
                    'Holiday earbuds: 400+ units sold last season',
                    'Proactive inventory positioning for peak seasons',
                    'Seasonal factors integrated into demand models'
                ],
                demoActions: [
                    'Switch to demand forecast chart',
                    'Show seasonal patterns in historical data',
                    'Demonstrate time range selection (3M vs 6M)'
                ]
            },
            {
                phase: 'workflow-automation',
                title: 'Intelligent Order Management',
                description: 'Demonstrate seamless approval workflow with instant feedback',
                keyPoints: [
                    'One-click purchase order creation',
                    'Automated email notifications to approvers',
                    'Real-time status updates with visual feedback',
                    'Integration with supplier systems'
                ],
                demoActions: [
                    'Create purchase order for critical item',
                    'Show approval/rejection workflow',
                    'Demonstrate status transitions and notifications',
                    'Show "Order sent to supplier" confirmation'
                ]
            },
            {
                phase: 'trending-products',
                title: 'Viral Product Management',
                description: 'Show how system handles trending and high-demand items',
                keyPoints: [
                    'TikTok viral phone grips: 400% demand increase',
                    'Influencer partnerships driving unprecedented sales',
                    'Real-time trend detection and inventory adjustment',
                    'Capitalize on short-lifecycle trending products'
                ],
                demoActions: [
                    'Show trending product indicators',
                    'Highlight rapid demand changes',
                    'Demonstrate quick response capabilities'
                ]
            },
            {
                phase: 'innovation-showcase',
                title: 'New Product Launch Support',
                description: 'Demonstrate handling of uncertain demand for new products',
                keyPoints: [
                    'AR glasses: Revolutionary new category',
                    'AI fitness tracker: 95% beta user satisfaction',
                    'Uncertainty modeling for new product launches',
                    'First-mover advantage positioning'
                ],
                demoActions: [
                    'Show confidence levels for new products',
                    'Highlight uncertainty indicators',
                    'Demonstrate conservative vs aggressive stocking strategies'
                ]
            }
        ];
    }
}

export const demoDataService = new DemoDataService();
export type { EnhancedInventoryItem };