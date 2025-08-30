import {
    Supplier,
    Product,
    Store,
    DonationFlow,
    SupplyChainFlow,
    CarbonHotspot,
    SupplierSwapRecommendation,
    DigitalTwinAnalytics,
    NetworkNode,
    NetworkEdge,
    InteractiveGraph,
    DeliveryMethod,
    DigitalTwinData,
    SupplyChainNode,
    SupplyChainConnection,
    SystemAlert,
    DigitalTwinMetrics
} from '../types/digitalTwin';

class DigitalTwinService {
    private suppliers: Supplier[] = [];
    private products: Product[] = [];
    private stores: Store[] = [];
    private donationFlows: DonationFlow[] = [];
    private supplyChainFlows: SupplyChainFlow[] = [];

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData() {
        // Mock delivery methods
        const deliveryMethods: DeliveryMethod[] = [
            { type: 'truck', carbonPerKm: 0.8, costPerKm: 1.2, capacity: 25000, speed: 80 },
            { type: 'rail', carbonPerKm: 0.3, costPerKm: 0.8, capacity: 100000, speed: 60 },
            { type: 'ship', carbonPerKm: 0.1, costPerKm: 0.4, capacity: 500000, speed: 25 },
            { type: 'air', carbonPerKm: 2.5, costPerKm: 5.0, capacity: 50000, speed: 800 }
        ];

        // Mock suppliers
        this.suppliers = [
            {
                id: 'supplier-1',
                name: 'GreenTech Manufacturing',
                location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
                carbonEmission: 2.5,
                sustainabilityScore: 85,
                products: ['electronics', 'components'],
                certifications: ['ISO 14001', 'Carbon Neutral'],
                deliveryMethods: [deliveryMethods[0], deliveryMethods[1]],
                monthlyVolume: 10000,
                costPerUnit: 45.50,
                reliability: 92
            },
            {
                id: 'supplier-2',
                name: 'EcoFriendly Textiles',
                location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
                carbonEmission: 1.8,
                sustainabilityScore: 78,
                products: ['clothing', 'fabrics'],
                certifications: ['GOTS', 'Fair Trade'],
                deliveryMethods: [deliveryMethods[0], deliveryMethods[2]],
                monthlyVolume: 15000,
                costPerUnit: 28.75,
                reliability: 88
            },
            {
                id: 'supplier-3',
                name: 'Traditional Industries Corp',
                location: { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL' },
                carbonEmission: 4.2,
                sustainabilityScore: 45,
                products: ['electronics', 'appliances'],
                certifications: ['ISO 9001'],
                deliveryMethods: [deliveryMethods[0], deliveryMethods[3]],
                monthlyVolume: 8000,
                costPerUnit: 38.20,
                reliability: 95
            },
            {
                id: 'supplier-4',
                name: 'Sustainable Foods Co',
                location: { lat: 45.5152, lng: -122.6784, address: 'Portland, OR' },
                carbonEmission: 1.2,
                sustainabilityScore: 92,
                products: ['food', 'beverages'],
                certifications: ['Organic', 'Carbon Negative', 'B-Corp'],
                deliveryMethods: [deliveryMethods[0], deliveryMethods[1]],
                monthlyVolume: 20000,
                costPerUnit: 15.80,
                reliability: 90
            },
            {
                id: 'supplier-5',
                name: 'Heavy Carbon Industries',
                location: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
                carbonEmission: 6.8,
                sustainabilityScore: 25,
                products: ['chemicals', 'materials'],
                certifications: [],
                deliveryMethods: [deliveryMethods[0], deliveryMethods[3]],
                monthlyVolume: 5000,
                costPerUnit: 52.30,
                reliability: 85
            }
        ];

        // Mock products
        this.products = [
            {
                id: 'product-1',
                name: 'Eco-Friendly Laptop',
                category: 'electronics',
                carbonFootprint: 3.2,
                supplierId: 'supplier-1',
                stores: ['store-1', 'store-2'],
                donationEligible: true,
                shelfLife: 1095, // 3 years
                weight: 2.5,
                volume: 0.008
            },
            {
                id: 'product-2',
                name: 'Organic Cotton T-Shirt',
                category: 'clothing',
                carbonFootprint: 2.1,
                supplierId: 'supplier-2',
                stores: ['store-2', 'store-3'],
                donationEligible: true,
                shelfLife: 730, // 2 years
                weight: 0.2,
                volume: 0.001
            },
            {
                id: 'product-3',
                name: 'Traditional Smartphone',
                category: 'electronics',
                carbonFootprint: 5.8,
                supplierId: 'supplier-3',
                stores: ['store-1', 'store-4'],
                donationEligible: false,
                shelfLife: 1095,
                weight: 0.18,
                volume: 0.0002
            },
            {
                id: 'product-4',
                name: 'Organic Energy Bar',
                category: 'food',
                carbonFootprint: 0.8,
                supplierId: 'supplier-4',
                stores: ['store-3', 'store-4'],
                donationEligible: true,
                shelfLife: 365,
                weight: 0.05,
                volume: 0.00005
            }
        ];

        // Mock stores
        this.stores = [
            {
                id: 'store-1',
                name: 'Downtown Tech Hub',
                location: { lat: 37.7849, lng: -122.4094, address: 'San Francisco Downtown' },
                type: 'retail',
                capacity: 50000,
                currentStock: 35000,
                demandForecast: 40000,
                carbonEfficiency: 75,
                wasteGeneration: 150
            },
            {
                id: 'store-2',
                name: 'Green Valley Mall',
                location: { lat: 37.4419, lng: -122.1430, address: 'Palo Alto, CA' },
                type: 'retail',
                capacity: 80000,
                currentStock: 60000,
                demandForecast: 70000,
                carbonEfficiency: 82,
                wasteGeneration: 120
            },
            {
                id: 'store-3',
                name: 'Central Distribution Center',
                location: { lat: 37.6879, lng: -122.4702, address: 'Daly City, CA' },
                type: 'distribution_center',
                capacity: 200000,
                currentStock: 150000,
                demandForecast: 180000,
                carbonEfficiency: 68,
                wasteGeneration: 300
            },
            {
                id: 'store-4',
                name: 'Eco-Friendly Warehouse',
                location: { lat: 37.8044, lng: -122.2711, address: 'Oakland, CA' },
                type: 'warehouse',
                capacity: 120000,
                currentStock: 80000,
                demandForecast: 100000,
                carbonEfficiency: 90,
                wasteGeneration: 80
            }
        ];

        // Mock donation flows
        this.donationFlows = [
            {
                id: 'donation-1',
                productId: 'product-1',
                fromStoreId: 'store-1',
                toOrganization: 'Tech for Schools',
                quantity: 25,
                carbonSaved: 80,
                date: new Date('2024-03-01'),
                status: 'completed'
            },
            {
                id: 'donation-2',
                productId: 'product-2',
                fromStoreId: 'store-2',
                toOrganization: 'Clothing Bank',
                quantity: 150,
                carbonSaved: 315,
                date: new Date('2024-03-05'),
                status: 'in_transit'
            },
            {
                id: 'donation-3',
                productId: 'product-4',
                fromStoreId: 'store-3',
                toOrganization: 'Food Rescue Network',
                quantity: 500,
                carbonSaved: 400,
                date: new Date('2024-03-08'),
                status: 'pending'
            }
        ];

        // Mock supply chain flows
        this.supplyChainFlows = [
            {
                id: 'flow-1',
                supplierId: 'supplier-1',
                productId: 'product-1',
                storeId: 'store-1',
                quantity: 100,
                distance: 15,
                deliveryMethod: deliveryMethods[0],
                totalCarbon: 32,
                totalCost: 4550,
                estimatedDelivery: new Date('2024-03-15')
            },
            {
                id: 'flow-2',
                supplierId: 'supplier-2',
                productId: 'product-2',
                storeId: 'store-2',
                quantity: 500,
                distance: 380,
                deliveryMethod: deliveryMethods[0],
                totalCarbon: 1358,
                totalCost: 14375,
                estimatedDelivery: new Date('2024-03-12')
            }
        ];
    }

    // Get all suppliers
    async getSuppliers(): Promise<Supplier[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...this.suppliers];
    }

    // Get all products
    async getProducts(): Promise<Product[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...this.products];
    }

    // Get all stores
    async getStores(): Promise<Store[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...this.stores];
    }

    // Get donation flows
    async getDonationFlows(): Promise<DonationFlow[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...this.donationFlows];
    }

    // Get supply chain flows
    async getSupplyChainFlows(): Promise<SupplyChainFlow[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return [...this.supplyChainFlows];
    }

    // Analyze carbon hotspots
    async analyzeCarbonHotspots(): Promise<CarbonHotspot[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const hotspots: CarbonHotspot[] = [];

        // Analyze suppliers
        this.suppliers.forEach(supplier => {
            if (supplier.carbonEmission > 4.0) {
                hotspots.push({
                    id: `hotspot-supplier-${supplier.id}`,
                    type: 'supplier',
                    entityId: supplier.id,
                    carbonEmission: supplier.carbonEmission,
                    severity: supplier.carbonEmission > 6.0 ? 'critical' : 'high',
                    improvementPotential: 40,
                    recommendations: [
                        'Switch to renewable energy sources',
                        'Implement carbon offset programs',
                        'Optimize manufacturing processes'
                    ]
                });
            }
        });

        // Analyze products
        this.products.forEach(product => {
            if (product.carbonFootprint > 4.0) {
                hotspots.push({
                    id: `hotspot-product-${product.id}`,
                    type: 'product',
                    entityId: product.id,
                    carbonEmission: product.carbonFootprint,
                    severity: product.carbonFootprint > 5.0 ? 'critical' : 'high',
                    improvementPotential: 30,
                    recommendations: [
                        'Use sustainable materials',
                        'Optimize packaging',
                        'Improve product lifecycle'
                    ]
                });
            }
        });

        return hotspots.sort((a, b) => b.carbonEmission - a.carbonEmission);
    }

    // Generate supplier swap recommendations
    async generateSupplierSwapRecommendations(): Promise<SupplierSwapRecommendation[]> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const recommendations: SupplierSwapRecommendation[] = [];

        // Find high-carbon suppliers and suggest low-carbon alternatives
        const highCarbonSuppliers = this.suppliers.filter(s => s.carbonEmission > 3.0);
        const lowCarbonSuppliers = this.suppliers.filter(s => s.carbonEmission < 2.5);

        highCarbonSuppliers.forEach(currentSupplier => {
            // Find products from this supplier
            const supplierProducts = this.products.filter(p => p.supplierId === currentSupplier.id);

            supplierProducts.forEach(product => {
                // Find alternative suppliers for the same category
                const alternativeSuppliers = lowCarbonSuppliers.filter(alt =>
                    alt.products.includes(product.category) && alt.id !== currentSupplier.id
                );

                alternativeSuppliers.forEach(altSupplier => {
                    const carbonSavings = currentSupplier.carbonEmission - altSupplier.carbonEmission;
                    const costImpact = ((altSupplier.costPerUnit - currentSupplier.costPerUnit) / currentSupplier.costPerUnit) * 100;
                    const reliabilityImpact = ((altSupplier.reliability - currentSupplier.reliability) / currentSupplier.reliability) * 100;

                    recommendations.push({
                        currentSupplierId: currentSupplier.id,
                        recommendedSupplierId: altSupplier.id,
                        productId: product.id,
                        carbonSavings,
                        costImpact,
                        reliabilityImpact,
                        estimatedAnnualSavings: carbonSavings * currentSupplier.monthlyVolume * 12,
                        implementationComplexity: Math.abs(costImpact) > 20 ? 'high' : Math.abs(costImpact) > 10 ? 'medium' : 'low',
                        paybackPeriod: Math.max(1, Math.round(Math.abs(costImpact) / 2))
                    });
                });
            });
        });

        return recommendations.sort((a, b) => b.estimatedAnnualSavings - a.estimatedAnnualSavings).slice(0, 10);
    }

    // Get digital twin analytics
    async getDigitalTwinAnalytics(): Promise<DigitalTwinAnalytics> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const [hotspots, swapOpportunities] = await Promise.all([
            this.analyzeCarbonHotspots(),
            this.generateSupplierSwapRecommendations()
        ]);

        const totalCarbonEmissions = this.suppliers.reduce((sum, s) => sum + (s.carbonEmission * s.monthlyVolume), 0);
        const totalRevenue = this.suppliers.reduce((sum, s) => sum + (s.costPerUnit * s.monthlyVolume), 0);
        const wasteReduction = this.donationFlows.reduce((sum, d) => sum + d.carbonSaved, 0);

        return {
            totalCarbonEmissions,
            carbonIntensity: totalCarbonEmissions / totalRevenue,
            wasteReduction,
            supplierEfficiencyScore: 72,
            networkOptimizationScore: 68,
            monthlyTrends: [
                { month: 'Jan', emissions: 45000, donations: 800, efficiency: 65 },
                { month: 'Feb', emissions: 42000, donations: 950, efficiency: 68 },
                { month: 'Mar', emissions: 38000, donations: 1200, efficiency: 72 }
            ],
            topEmitters: hotspots.slice(0, 5),
            swapOpportunities: swapOpportunities.slice(0, 5)
        };
    }

    // Generate interactive graph data
    async generateInteractiveGraph(): Promise<InteractiveGraph> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const nodes: NetworkNode[] = [];
        const edges: NetworkEdge[] = [];

        // Add supplier nodes
        this.suppliers.forEach((supplier, index) => {
            nodes.push({
                id: supplier.id,
                type: 'supplier',
                name: supplier.name,
                position: { x: 100 + (index * 150), y: 100 },
                carbonLevel: supplier.carbonEmission,
                size: Math.max(20, supplier.monthlyVolume / 500),
                connections: supplier.products,
                metadata: supplier
            });
        });

        // Add product nodes
        this.products.forEach((product, index) => {
            nodes.push({
                id: product.id,
                type: 'product',
                name: product.name,
                position: { x: 200 + (index * 120), y: 300 },
                carbonLevel: product.carbonFootprint,
                size: Math.max(15, product.weight * 10),
                connections: product.stores,
                metadata: product
            });
        });

        // Add store nodes
        this.stores.forEach((store, index) => {
            nodes.push({
                id: store.id,
                type: 'store',
                name: store.name,
                position: { x: 150 + (index * 140), y: 500 },
                carbonLevel: 100 - store.carbonEfficiency,
                size: Math.max(25, store.capacity / 5000),
                connections: [],
                metadata: store
            });
        });

        // Add donation nodes
        this.donationFlows.forEach((donation, index) => {
            nodes.push({
                id: donation.id,
                type: 'donation',
                name: donation.toOrganization,
                position: { x: 300 + (index * 100), y: 650 },
                carbonLevel: -donation.carbonSaved, // Negative for carbon savings
                size: Math.max(10, donation.quantity / 10),
                connections: [donation.fromStoreId],
                metadata: donation
            });
        });

        // Add supply chain edges
        this.supplyChainFlows.forEach(flow => {
            edges.push({
                id: `supply-${flow.id}`,
                source: flow.supplierId,
                target: flow.productId,
                type: 'supply',
                weight: flow.quantity,
                carbonFlow: flow.totalCarbon,
                animated: true,
                color: this.getCarbonColor(flow.totalCarbon / flow.quantity)
            });
        });

        // Add product-store edges
        this.products.forEach(product => {
            product.stores.forEach(storeId => {
                edges.push({
                    id: `product-store-${product.id}-${storeId}`,
                    source: product.id,
                    target: storeId,
                    type: 'transport',
                    weight: 1,
                    carbonFlow: product.carbonFootprint,
                    animated: false,
                    color: this.getCarbonColor(product.carbonFootprint)
                });
            });
        });

        // Add donation edges
        this.donationFlows.forEach(donation => {
            edges.push({
                id: `donation-${donation.id}`,
                source: donation.fromStoreId,
                target: donation.id,
                type: 'donation',
                weight: donation.quantity,
                carbonFlow: -donation.carbonSaved,
                animated: true,
                color: '#10B981' // Green for positive environmental impact
            });
        });

        return {
            nodes,
            edges,
            layout: 'force',
            filters: {
                showSuppliers: true,
                showProducts: true,
                showStores: true,
                showDonations: true,
                carbonThreshold: 0
            }
        };
    }

    private getCarbonColor(carbonLevel: number): string {
        if (carbonLevel < 1) return '#10B981'; // Green - low carbon
        if (carbonLevel < 3) return '#F59E0B'; // Yellow - medium carbon
        if (carbonLevel < 5) return '#F97316'; // Orange - high carbon
        return '#EF4444'; // Red - very high carbon
    }

    // Get comprehensive digital twin data for dashboard
    async getDigitalTwinData(): Promise<DigitalTwinData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Convert stores to supply chain nodes
        const nodes: SupplyChainNode[] = this.stores.map(store => ({
            id: store.id,
            name: store.name,
            type: store.type,
            location: store.location.address,
            status: this.getNodeStatus(store),
            capacity: {
                current: store.currentStock,
                max: store.capacity
            },
            metrics: {
                efficiency: store.carbonEfficiency / 100,
                throughput: store.demandForecast / 24 // per hour
            }
        }));

        // Add supplier nodes
        this.suppliers.forEach(supplier => {
            nodes.push({
                id: supplier.id,
                name: supplier.name,
                type: 'supplier' as const,
                location: supplier.location.address,
                status: supplier.sustainabilityScore > 70 ? 'operational' :
                    supplier.sustainabilityScore > 40 ? 'warning' : 'critical',
                capacity: {
                    current: supplier.monthlyVolume,
                    max: supplier.monthlyVolume * 1.2
                },
                metrics: {
                    efficiency: supplier.reliability / 100,
                    throughput: supplier.monthlyVolume / (30 * 24) // per hour
                }
            });
        });

        // Create connections from supply chain flows
        const connections: SupplyChainConnection[] = this.supplyChainFlows.map(flow => ({
            id: flow.id,
            source: flow.supplierId,
            target: flow.storeId,
            type: 'supply' as const,
            status: 'active' as const,
            flow: flow.quantity,
            carbonEmission: flow.totalCarbon
        }));

        // Generate system alerts
        const alerts: SystemAlert[] = [
            {
                id: 'alert-1',
                title: 'High Carbon Emissions Detected',
                description: 'Supplier "Heavy Carbon Industries" is exceeding carbon emission thresholds',
                severity: 'high' as const,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                nodeId: 'supplier-5'
            },
            {
                id: 'alert-2',
                title: 'Capacity Warning',
                description: 'Central Distribution Center approaching maximum capacity',
                severity: 'medium' as const,
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                nodeId: 'store-3'
            },
            {
                id: 'alert-3',
                title: 'Delivery Delay',
                description: 'Supply chain flow from GreenTech Manufacturing experiencing delays',
                severity: 'low' as const,
                timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                nodeId: 'supplier-1'
            },
            {
                id: 'alert-4',
                title: 'Sustainability Score Drop',
                description: 'Traditional Industries Corp sustainability metrics declining',
                severity: 'critical' as const,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                nodeId: 'supplier-3'
            }
        ];

        // Calculate overall metrics
        const totalCapacity = nodes.reduce((sum, node) => sum + node.capacity.max, 0);
        const totalCurrent = nodes.reduce((sum, node) => sum + node.capacity.current, 0);
        const avgEfficiency = nodes.reduce((sum, node) => sum + (node.metrics?.efficiency || 0), 0) / nodes.length;
        const totalCarbonEmissions = connections.reduce((sum, conn) => sum + conn.carbonEmission, 0);

        const metrics: DigitalTwinMetrics = {
            efficiency: avgEfficiency,
            carbonFootprint: totalCarbonEmissions,
            throughput: totalCurrent / totalCapacity,
            reliability: 0.92
        };

        // Get supplier swap recommendations
        const recommendations = await this.generateSupplierSwapRecommendations();

        return {
            nodes,
            connections,
            metrics,
            alerts,
            recommendations
        };
    }

    private getNodeStatus(store: Store): 'operational' | 'warning' | 'critical' | 'maintenance' {
        const utilization = store.currentStock / store.capacity;
        const efficiency = store.carbonEfficiency;

        if (efficiency < 50 || utilization > 0.95) return 'critical';
        if (efficiency < 70 || utilization > 0.85) return 'warning';
        if (Math.random() < 0.1) return 'maintenance'; // 10% chance of maintenance
        return 'operational';
    }

    // Simulate supplier swap
    async simulateSupplierSwap(swapId: string): Promise<{
        success: boolean;
        message: string;
        carbonReduction: number;
        costImpact: number;
    }> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock simulation results
        return {
            success: true,
            message: 'Supplier swap simulation completed successfully',
            carbonReduction: Math.random() * 1000 + 500,
            costImpact: (Math.random() - 0.5) * 20
        };
    }
}

export const digitalTwinService = new DigitalTwinService();