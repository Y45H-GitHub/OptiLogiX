import { SurplusInventoryItem, NetworkParticipant, InventoryRequest, NetworkAnalytics } from '../types/surplusNetwork';

export interface DemoScenario {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    businessImpact: string;
    items: SurplusInventoryItem[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    costSavings: number;
    wasteReduction: number; // in kg
}

export interface PresentationPhase {
    phase: string;
    title: string;
    description: string;
    keyPoints: string[];
    demoActions: string[];
    metrics: {
        costSavings: number;
        wasteReduction: number;
        itemsRescued: number;
    };
}

class SurplusNetworkDemoService {
    /**
     * Generate compelling demo scenarios for hackathon presentation
     */
    getDemoScenarios(): DemoScenario[] {
        return [
            {
                id: 'overstocked-electronics',
                name: 'Overstocked Electronics',
                description: 'Critical surplus from tech company downsizing',
                icon: '💻',
                color: 'bg-gradient-to-r from-red-600 to-red-700',
                businessImpact: 'Prevent $125K+ in write-offs, recover 60% of original investment',
                urgencyLevel: 'critical',
                costSavings: 125000,
                wasteReduction: 2500, // kg of electronic waste prevented
                items: this.getOverstockedElectronics()
            },
            {
                id: 'seasonal-clearance',
                name: 'Seasonal Clearance',
                description: 'End-of-season inventory requiring immediate redistribution',
                icon: '🌡️',
                color: 'bg-gradient-to-r from-orange-600 to-orange-700',
                businessImpact: 'Clear $85K inventory before expiration, help 15+ businesses',
                urgencyLevel: 'high',
                costSavings: 85000,
                wasteReduction: 1800,
                items: this.getSeasonalClearance()
            },
            {
                id: 'office-liquidation',
                name: 'Office Liquidation',
                description: 'Complete office closure creating massive surplus opportunity',
                icon: '🏢',
                color: 'bg-gradient-to-r from-blue-600 to-blue-700',
                businessImpact: 'Rescue $200K+ in office assets, support 25+ growing companies',
                urgencyLevel: 'medium',
                costSavings: 200000,
                wasteReduction: 5000,
                items: this.getOfficeLiquidation()
            }
        ];
    }

    /**
     * Get overstocked electronics scenario - critical surplus from tech downsizing
     */
    private getOverstockedElectronics(): SurplusInventoryItem[] {
        return [
            {
                id: 'electronics-1',
                participantId: 'tech-corp-sf',
                sku: 'MACBOOK-PRO-M2',
                productName: 'MacBook Pro M2 (Sealed)',
                description: 'Brand new MacBook Pro M2 16" laptops, still in original packaging. Ordered for expansion that was cancelled.',
                category: 'Electronics',
                quantityAvailable: 45,
                unitPrice: 1899.99,
                condition: 'new',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/macbook-pro.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-01')
            },
            {
                id: 'electronics-2',
                participantId: 'tech-corp-sf',
                sku: 'IPHONE-15-PRO',
                productName: 'iPhone 15 Pro (Company Phones)',
                description: 'Corporate iPhone 15 Pro devices, lightly used for 3 months. Excellent condition with cases.',
                category: 'Electronics',
                quantityAvailable: 120,
                unitPrice: 699.99,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/iphone-15-pro.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-02'),
                updatedAt: new Date('2024-03-02')
            },
            {
                id: 'electronics-3',
                participantId: 'tech-corp-sf',
                sku: 'MONITOR-4K-32',
                productName: '32" 4K Monitors (Dell UltraSharp)',
                description: 'Professional 4K monitors used in development team. Perfect for design and development work.',
                category: 'Electronics',
                quantityAvailable: 85,
                unitPrice: 449.99,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/dell-4k-monitor.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-03'),
                updatedAt: new Date('2024-03-03')
            }
        ];
    }

    /**
     * Get seasonal clearance scenario - time-sensitive inventory
     */
    private getSeasonalClearance(): SurplusInventoryItem[] {
        return [
            {
                id: 'seasonal-1',
                participantId: 'retail-chain-ny',
                sku: 'HEATER-CERAMIC-1500W',
                productName: 'Ceramic Space Heaters (End of Winter)',
                description: 'High-efficiency ceramic heaters, overstocked from mild winter. Must clear before summer.',
                category: 'Seasonal',
                quantityAvailable: 200,
                unitPrice: 89.99,
                condition: 'new',
                expirationDate: new Date('2024-05-31'), // Must clear before summer
                location: 'New York, NY',
                images: ['/images/ceramic-heater.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-15'),
                updatedAt: new Date('2024-03-15')
            },
            {
                id: 'seasonal-2',
                participantId: 'retail-chain-ny',
                sku: 'BLANKET-ELECTRIC-QUEEN',
                productName: 'Electric Blankets (Winter Clearance)',
                description: 'Premium electric blankets with dual controls. Overordered for winter season.',
                category: 'Seasonal',
                quantityAvailable: 150,
                unitPrice: 79.99,
                condition: 'new',
                expirationDate: new Date('2024-04-30'),
                location: 'New York, NY',
                images: ['/images/electric-blanket.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-16'),
                updatedAt: new Date('2024-03-16')
            },
            {
                id: 'seasonal-3',
                participantId: 'retail-chain-ny',
                sku: 'COAT-WINTER-PARKA',
                productName: 'Winter Parkas (Various Sizes)',
                description: 'High-quality winter parkas, assorted sizes. Perfect for next season or cold climate businesses.',
                category: 'Seasonal',
                quantityAvailable: 300,
                unitPrice: 129.99,
                condition: 'new',
                expirationDate: new Date('2024-06-30'),
                location: 'New York, NY',
                images: ['/images/winter-parka.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-17'),
                updatedAt: new Date('2024-03-17')
            }
        ];
    }

    /**
     * Get office liquidation scenario - massive opportunity
     */
    private getOfficeLiquidation(): SurplusInventoryItem[] {
        return [
            {
                id: 'office-1',
                participantId: 'corporate-liquidation',
                sku: 'DESK-HERMAN-MILLER',
                productName: 'Herman Miller Standing Desks',
                description: 'Premium adjustable standing desks from corporate headquarters closure. Excellent condition.',
                category: 'Office Supplies',
                quantityAvailable: 75,
                unitPrice: 899.99,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'Chicago, IL',
                images: ['/images/herman-miller-desk.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-10'),
                updatedAt: new Date('2024-03-10')
            },
            {
                id: 'office-2',
                participantId: 'corporate-liquidation',
                sku: 'CHAIR-AERON-SIZE-B',
                productName: 'Aeron Chairs (Size B)',
                description: 'Iconic Herman Miller Aeron chairs, lightly used in executive offices. Fully adjustable.',
                category: 'Office Supplies',
                quantityAvailable: 120,
                unitPrice: 649.99,
                condition: 'good',
                expirationDate: undefined,
                location: 'Chicago, IL',
                images: ['/images/aeron-chair.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-11'),
                updatedAt: new Date('2024-03-11')
            },
            {
                id: 'office-3',
                participantId: 'corporate-liquidation',
                sku: 'PRINTER-XEROX-WORKCENTRE',
                productName: 'Xerox WorkCentre Printers',
                description: 'Commercial-grade multifunction printers with low page counts. Perfect for growing businesses.',
                category: 'Office Supplies',
                quantityAvailable: 25,
                unitPrice: 1299.99,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'Chicago, IL',
                images: ['/images/xerox-workcentre.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-12'),
                updatedAt: new Date('2024-03-12')
            },
            {
                id: 'office-4',
                participantId: 'corporate-liquidation',
                sku: 'CONFERENCE-TABLE-12FT',
                productName: '12ft Conference Tables',
                description: 'Solid wood conference tables from executive boardrooms. Seats 12 people comfortably.',
                category: 'Office Supplies',
                quantityAvailable: 8,
                unitPrice: 2499.99,
                condition: 'good',
                expirationDate: undefined,
                location: 'Chicago, IL',
                images: ['/images/conference-table.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-13'),
                updatedAt: new Date('2024-03-13')
            }
        ];
    }

    /**
     * Get demo participants for scenarios
     */
    getDemoParticipants(): NetworkParticipant[] {
        return [
            {
                id: 'tech-corp-sf',
                companyName: 'TechCorp Solutions (Downsizing)',
                contactEmail: 'liquidation@techcorp.com',
                contactPhone: '+1-415-555-0123',
                address: '123 Market Street, San Francisco, CA 94105',
                verificationStatus: 'verified',
                reputationScore: 4.9,
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-03-01')
            },
            {
                id: 'retail-chain-ny',
                companyName: 'Seasonal Retail Chain',
                contactEmail: 'surplus@seasonalretail.com',
                contactPhone: '+1-212-555-0456',
                address: '456 Broadway, New York, NY 10013',
                verificationStatus: 'verified',
                reputationScore: 4.7,
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-03-15')
            },
            {
                id: 'corporate-liquidation',
                companyName: 'Corporate Assets Liquidation',
                contactEmail: 'assets@corpliquidation.com',
                contactPhone: '+1-312-555-0789',
                address: '789 LaSalle Street, Chicago, IL 60604',
                verificationStatus: 'verified',
                reputationScore: 4.8,
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-10')
            }
        ];
    }

    /**
     * Get presentation script for hackathon demo
     */
    getPresentationScript(): PresentationPhase[] {
        return [
            {
                phase: 'problem-introduction',
                title: 'The $1.2 Trillion Waste Problem',
                description: 'Showcase the massive scale of surplus inventory waste',
                keyPoints: [
                    '$1.2 trillion in surplus inventory sits unused globally',
                    '40% of business assets become obsolete within 2 years',
                    'Companies lose 15-25% of inventory value to write-offs',
                    'Environmental impact: 2.6 billion tons of waste annually'
                ],
                demoActions: [
                    'Show real-time waste counter animation',
                    'Display global surplus inventory statistics',
                    'Highlight environmental impact metrics'
                ],
                metrics: {
                    costSavings: 0,
                    wasteReduction: 0,
                    itemsRescued: 0
                }
            },
            {
                phase: 'critical-electronics',
                title: 'Critical Electronics Rescue',
                description: 'Demonstrate high-value electronics surplus scenario',
                keyPoints: [
                    'TechCorp downsizing: 45 MacBook Pros + 120 iPhones at risk',
                    'Original value: $170K, potential recovery: $125K (73%)',
                    'Instant network matching with 15+ verified buyers',
                    'Prevent 2.5 tons of electronic waste from landfills'
                ],
                demoActions: [
                    'Switch to overstocked electronics scenario',
                    'Show high-value items with urgent status',
                    'Demonstrate instant buyer matching',
                    'Display environmental impact prevention'
                ],
                metrics: {
                    costSavings: 125000,
                    wasteReduction: 2500,
                    itemsRescued: 250
                }
            },
            {
                phase: 'seasonal-urgency',
                title: 'Time-Sensitive Seasonal Rescue',
                description: 'Show seasonal inventory with expiration pressure',
                keyPoints: [
                    'Winter clearance: 650 items expiring in 60 days',
                    'Retail chain avoiding $85K write-off',
                    'Perfect timing for southern hemisphere businesses',
                    'Cross-seasonal redistribution maximizes value'
                ],
                demoActions: [
                    'Switch to seasonal clearance scenario',
                    'Highlight expiration date urgency',
                    'Show geographic redistribution opportunities',
                    'Demonstrate seasonal arbitrage value'
                ],
                metrics: {
                    costSavings: 85000,
                    wasteReduction: 1800,
                    itemsRescued: 650
                }
            },
            {
                phase: 'office-liquidation',
                title: 'Massive Office Liquidation',
                description: 'Showcase large-scale corporate asset redistribution',
                keyPoints: [
                    'Corporate closure: $200K+ in premium office furniture',
                    'Herman Miller desks & Aeron chairs available',
                    'Perfect for 25+ growing startups and remote workers',
                    'Transform waste into startup ecosystem fuel'
                ],
                demoActions: [
                    'Switch to office liquidation scenario',
                    'Show premium furniture with high value',
                    'Highlight startup ecosystem benefits',
                    'Display circular economy impact'
                ],
                metrics: {
                    costSavings: 200000,
                    wasteReduction: 5000,
                    itemsRescued: 228
                }
            },
            {
                phase: 'network-impact',
                title: 'Network Effect & Impact',
                description: 'Show cumulative impact and network growth',
                keyPoints: [
                    'Total network impact: $410K+ rescued, 9.3 tons waste prevented',
                    '1,128 items redistributed across 40+ businesses',
                    'Average 68% value recovery vs traditional liquidation',
                    'Network grows 40% monthly through success stories'
                ],
                demoActions: [
                    'Show cumulative impact dashboard',
                    'Display network growth metrics',
                    'Highlight success story testimonials',
                    'Show ROI comparison with traditional methods'
                ],
                metrics: {
                    costSavings: 410000,
                    wasteReduction: 9300,
                    itemsRescued: 1128
                }
            },
            {
                phase: 'future-vision',
                title: 'Scaling the Circular Economy',
                description: 'Present vision for global surplus network',
                keyPoints: [
                    'AI-powered matching reduces waste by 80%',
                    'Blockchain verification ensures trust and transparency',
                    'Global network connecting 10,000+ businesses',
                    'Preventing $50B+ in annual inventory waste'
                ],
                demoActions: [
                    'Show AI matching algorithm in action',
                    'Display global network visualization',
                    'Highlight blockchain trust features',
                    'Present scaling projections'
                ],
                metrics: {
                    costSavings: 50000000000,
                    wasteReduction: 2600000000,
                    itemsRescued: 100000000
                }
            }
        ];
    }

    /**
     * Get enhanced analytics for demo scenarios
     */
    getDemoAnalytics(scenarioId?: string): NetworkAnalytics {
        const scenarios = this.getDemoScenarios();

        if (scenarioId) {
            const scenario = scenarios.find(s => s.id === scenarioId);
            if (scenario) {
                return {
                    totalItemsShared: scenario.items.length,
                    totalItemsReceived: Math.floor(scenario.items.length * 0.7),
                    totalCostSavings: scenario.costSavings,
                    averageResponseTime: 1.2, // Fast response for demo
                    successfulTransfers: Math.floor(scenario.items.length * 0.85),
                    networkReputationScore: 4.8,
                    monthlyTrends: [
                        { month: 'Jan 2024', itemsShared: 45, itemsReceived: 32, costSavings: scenario.costSavings * 0.3 },
                        { month: 'Feb 2024', itemsShared: 67, itemsReceived: 48, costSavings: scenario.costSavings * 0.4 },
                        { month: 'Mar 2024', itemsShared: scenario.items.length, itemsReceived: Math.floor(scenario.items.length * 0.7), costSavings: scenario.costSavings * 0.3 }
                    ]
                };
            }
        }

        // Overall network analytics
        const totalCostSavings = scenarios.reduce((sum, s) => sum + s.costSavings, 0);
        const totalItems = scenarios.reduce((sum, s) => sum + s.items.length, 0);

        return {
            totalItemsShared: totalItems,
            totalItemsReceived: Math.floor(totalItems * 0.72),
            totalCostSavings: totalCostSavings,
            averageResponseTime: 1.8,
            successfulTransfers: Math.floor(totalItems * 0.88),
            networkReputationScore: 4.7,
            monthlyTrends: [
                { month: 'Jan 2024', itemsShared: 156, itemsReceived: 112, costSavings: totalCostSavings * 0.25 },
                { month: 'Feb 2024', itemsShared: 203, itemsReceived: 146, costSavings: totalCostSavings * 0.35 },
                { month: 'Mar 2024', itemsShared: totalItems, itemsReceived: Math.floor(totalItems * 0.72), costSavings: totalCostSavings * 0.4 }
            ]
        };
    }

    /**
     * Generate success animations and transitions
     */
    getSuccessAnimations() {
        return {
            matchFound: {
                duration: 2000,
                steps: [
                    { time: 0, message: 'Analyzing surplus inventory...', progress: 20 },
                    { time: 500, message: 'Scanning network for matches...', progress: 50 },
                    { time: 1000, message: 'Found 3 potential buyers!', progress: 80 },
                    { time: 1500, message: '✅ Match confirmed! Buyer notified.', progress: 100 }
                ]
            },
            transferComplete: {
                duration: 3000,
                steps: [
                    { time: 0, message: 'Transfer initiated...', progress: 25 },
                    { time: 1000, message: 'Items picked up and in transit...', progress: 50 },
                    { time: 2000, message: 'Delivered successfully!', progress: 75 },
                    { time: 2500, message: '✅ $12,500 saved from waste!', progress: 100 }
                ]
            },
            networkGrowth: {
                duration: 2500,
                steps: [
                    { time: 0, message: 'New participant joining...', progress: 30 },
                    { time: 800, message: 'Verification complete...', progress: 60 },
                    { time: 1600, message: 'Network expanded!', progress: 90 },
                    { time: 2000, message: '🎉 +1 Verified Business', progress: 100 }
                ]
            }
        };
    }
}

export const surplusNetworkDemoService = new SurplusNetworkDemoService();
export type { DemoScenario, PresentationPhase };