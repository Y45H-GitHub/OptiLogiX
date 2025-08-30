import {
    SurplusInventoryItem,
    InventoryRequest,
    NetworkParticipant,
    Transfer,
    InventoryFilters,
    NetworkAnalytics
} from '../types/surplusNetwork';
import { surplusNetworkDemoService, DemoScenario } from './surplusNetworkDemoService';

// In-memory data store for demo purposes
class SurplusNetworkDataStore {
    private participants: NetworkParticipant[] = [];
    private surplusInventory: SurplusInventoryItem[] = [];
    private requests: InventoryRequest[] = [];
    private transfers: Transfer[] = [];

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData() {
        // Mock network participants
        this.participants = [
            {
                id: 'participant-1',
                companyName: 'TechCorp Solutions',
                contactEmail: 'procurement@techcorp.com',
                contactPhone: '+1-555-0123',
                address: '123 Tech Street, San Francisco, CA 94105',
                verificationStatus: 'verified',
                reputationScore: 4.8,
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15')
            },
            {
                id: 'participant-2',
                companyName: 'Global Office Supplies',
                contactEmail: 'inventory@globaloffice.com',
                contactPhone: '+1-555-0456',
                address: '456 Business Ave, New York, NY 10001',
                verificationStatus: 'verified',
                reputationScore: 4.6,
                createdAt: new Date('2024-01-20'),
                updatedAt: new Date('2024-01-20')
            },
            {
                id: 'participant-3',
                companyName: 'Seasonal Retail Co',
                contactEmail: 'surplus@seasonalretail.com',
                contactPhone: '+1-555-0789',
                address: '789 Retail Blvd, Chicago, IL 60601',
                verificationStatus: 'verified',
                reputationScore: 4.4,
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-01')
            }
        ];

        // Mock surplus inventory with realistic examples
        this.surplusInventory = [
            // Electronics
            {
                id: 'surplus-1',
                participantId: 'participant-1',
                sku: 'LAPTOP-DEL-001',
                productName: 'Dell Latitude 5520 Laptops',
                description: 'Business laptops with Intel i5, 8GB RAM, 256GB SSD. Excellent for office work.',
                category: 'Electronics',
                quantityAvailable: 25,
                unitPrice: 650.00,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/dell-laptop.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-15'),
                updatedAt: new Date('2024-02-15')
            },
            {
                id: 'surplus-2',
                participantId: 'participant-1',
                sku: 'MON-SAM-002',
                productName: 'Samsung 24" Monitors',
                description: '24-inch Full HD monitors, perfect for dual-screen setups. Minor cosmetic wear.',
                category: 'Electronics',
                quantityAvailable: 40,
                unitPrice: 120.00,
                condition: 'good',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/samsung-monitor.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-18'),
                updatedAt: new Date('2024-02-18')
            },
            // Office Supplies
            {
                id: 'surplus-3',
                participantId: 'participant-2',
                sku: 'CHAIR-ERG-003',
                productName: 'Ergonomic Office Chairs',
                description: 'High-quality ergonomic chairs with lumbar support. Slight fabric wear but fully functional.',
                category: 'Office Supplies',
                quantityAvailable: 15,
                unitPrice: 180.00,
                condition: 'good',
                expirationDate: undefined,
                location: 'New York, NY',
                images: ['/images/office-chair.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-20'),
                updatedAt: new Date('2024-02-20')
            },
            {
                id: 'surplus-4',
                participantId: 'participant-2',
                sku: 'DESK-STA-004',
                productName: 'Standing Desk Converters',
                description: 'Adjustable standing desk converters, brand new in original packaging.',
                category: 'Office Supplies',
                quantityAvailable: 30,
                unitPrice: 95.00,
                condition: 'new',
                expirationDate: undefined,
                location: 'New York, NY',
                images: ['/images/standing-desk.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-22'),
                updatedAt: new Date('2024-02-22')
            },
            // Seasonal Items
            {
                id: 'surplus-5',
                participantId: 'participant-3',
                sku: 'HEAT-POR-005',
                productName: 'Portable Space Heaters',
                description: 'Energy-efficient portable heaters, overstocked from winter season.',
                category: 'Seasonal',
                quantityAvailable: 50,
                unitPrice: 45.00,
                condition: 'new',
                expirationDate: new Date('2024-12-31'),
                location: 'Chicago, IL',
                images: ['/images/space-heater.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-25'),
                updatedAt: new Date('2024-02-25')
            },
            {
                id: 'surplus-6',
                participantId: 'participant-3',
                sku: 'FAN-CIL-006',
                productName: 'Ceiling Fans',
                description: 'Modern ceiling fans with LED lighting, excess inventory from summer preparation.',
                category: 'Seasonal',
                quantityAvailable: 20,
                unitPrice: 85.00,
                condition: 'new',
                expirationDate: new Date('2024-08-31'),
                location: 'Chicago, IL',
                images: ['/images/ceiling-fan.jpg'],
                status: 'available',
                createdAt: new Date('2024-02-28'),
                updatedAt: new Date('2024-02-28')
            },
            // Additional realistic items
            {
                id: 'surplus-7',
                participantId: 'participant-1',
                sku: 'PRINT-HP-007',
                productName: 'HP LaserJet Printers',
                description: 'Network-ready laser printers, lightly used in corporate environment.',
                category: 'Electronics',
                quantityAvailable: 8,
                unitPrice: 220.00,
                condition: 'like_new',
                expirationDate: undefined,
                location: 'San Francisco, CA',
                images: ['/images/hp-printer.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-01')
            },
            {
                id: 'surplus-8',
                participantId: 'participant-2',
                sku: 'PAPER-A4-008',
                productName: 'Premium Copy Paper',
                description: 'High-quality A4 copy paper, 500 sheets per ream. Overordered for Q1.',
                category: 'Office Supplies',
                quantityAvailable: 200,
                unitPrice: 8.50,
                condition: 'new',
                expirationDate: new Date('2026-12-31'),
                location: 'New York, NY',
                images: ['/images/copy-paper.jpg'],
                status: 'available',
                createdAt: new Date('2024-03-05'),
                updatedAt: new Date('2024-03-05')
            }
        ];

        // Mock inventory requests
        this.requests = [
            {
                id: 'request-1',
                requesterId: 'participant-2',
                surplusItemId: 'surplus-1',
                requestedQuantity: 10,
                urgencyLevel: 'medium',
                deliveryPreference: 'Standard shipping within 5-7 business days',
                notes: 'Need for new employee onboarding program',
                status: 'pending',
                createdAt: new Date('2024-03-06'),
                updatedAt: new Date('2024-03-06')
            },
            {
                id: 'request-2',
                requesterId: 'participant-3',
                surplusItemId: 'surplus-4',
                requestedQuantity: 5,
                urgencyLevel: 'low',
                deliveryPreference: 'Pickup preferred',
                notes: 'Expanding remote work setup for employees',
                status: 'accepted',
                createdAt: new Date('2024-03-07'),
                updatedAt: new Date('2024-03-08')
            }
        ];
    }

    // Getter methods for accessing data
    getParticipants(): NetworkParticipant[] {
        return [...this.participants];
    }

    getSurplusInventory(): SurplusInventoryItem[] {
        return [...this.surplusInventory];
    }

    getRequests(): InventoryRequest[] {
        return [...this.requests];
    }

    getTransfers(): Transfer[] {
        return [...this.transfers];
    }

    // Add new surplus inventory item
    addSurplusItem(item: Omit<SurplusInventoryItem, 'id' | 'createdAt' | 'updatedAt'>): SurplusInventoryItem {
        const newItem: SurplusInventoryItem = {
            ...item,
            id: `surplus-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.surplusInventory.push(newItem);
        return newItem;
    }

    // Add new inventory request
    addRequest(request: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'>): InventoryRequest {
        const newRequest: InventoryRequest = {
            ...request,
            id: `request-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.requests.push(newRequest);
        return newRequest;
    }

    // Update surplus item status
    updateSurplusItemStatus(id: string, status: SurplusInventoryItem['status']): boolean {
        const item = this.surplusInventory.find(item => item.id === id);
        if (item) {
            item.status = status;
            item.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Update request status
    updateRequestStatus(id: string, status: InventoryRequest['status']): boolean {
        const request = this.requests.find(req => req.id === id);
        if (request) {
            request.status = status;
            request.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Search and filter surplus inventory
    searchSurplusInventory(filters: InventoryFilters): SurplusInventoryItem[] {
        let filtered = this.surplusInventory.filter(item => item.status === 'available');

        if (filters.category) {
            filtered = filtered.filter(item =>
                item.category.toLowerCase().includes(filters.category!.toLowerCase())
            );
        }

        if (filters.location) {
            filtered = filtered.filter(item =>
                item.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
        }

        if (filters.condition && filters.condition.length > 0) {
            filtered = filtered.filter(item =>
                filters.condition!.includes(item.condition)
            );
        }

        if (filters.priceRange) {
            filtered = filtered.filter(item =>
                item.unitPrice >= filters.priceRange!.min &&
                item.unitPrice <= filters.priceRange!.max
            );
        }

        if (filters.quantityRange) {
            filtered = filtered.filter(item =>
                item.quantityAvailable >= filters.quantityRange!.min &&
                item.quantityAvailable <= filters.quantityRange!.max
            );
        }

        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.productName.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.sku.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }
}

// Singleton instance for the mock data store
const dataStore = new SurplusNetworkDataStore();

// Mock service implementation
export class SurplusNetworkService {
    // Get all surplus inventory
    async getSurplusInventory(): Promise<SurplusInventoryItem[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return dataStore.getSurplusInventory();
    }

    // Search surplus inventory with filters
    async searchSurplusInventory(filters: InventoryFilters): Promise<SurplusInventoryItem[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return dataStore.searchSurplusInventory(filters);
    }

    // Add new surplus inventory item
    async addSurplusItem(item: Omit<SurplusInventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurplusInventoryItem> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return dataStore.addSurplusItem(item);
    }

    // Get all inventory requests
    async getInventoryRequests(): Promise<InventoryRequest[]> {
        await new Promise(resolve => setTimeout(resolve, 250));
        return dataStore.getRequests();
    }

    // Create new inventory request
    async createInventoryRequest(request: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryRequest> {
        await new Promise(resolve => setTimeout(resolve, 350));
        const newRequest = dataStore.addRequest(request);

        // Simulate instant matching logic
        const surplusItem = dataStore.getSurplusInventory().find(item => item.id === request.surplusItemId);
        if (surplusItem && surplusItem.quantityAvailable >= request.requestedQuantity) {
            // Simulate a match found scenario
            setTimeout(() => {
                // In a real app, this would trigger a notification system
                console.log('Match found for request:', newRequest.id);
            }, 1000);
        }

        return newRequest;
    }

    // Update surplus item status
    async updateSurplusItemStatus(id: string, status: SurplusInventoryItem['status']): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return dataStore.updateSurplusItemStatus(id, status);
    }

    // Update request status
    async updateRequestStatus(id: string, status: InventoryRequest['status']): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return dataStore.updateRequestStatus(id, status);
    }

    // Get network participants
    async getNetworkParticipants(): Promise<NetworkParticipant[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return dataStore.getParticipants();
    }

    // Get mock analytics data
    async getNetworkAnalytics(scenarioId?: string): Promise<NetworkAnalytics> {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (scenarioId) {
            return surplusNetworkDemoService.getDemoAnalytics(scenarioId);
        }

        return surplusNetworkDemoService.getDemoAnalytics();
    }

    // Get demo scenarios for presentation
    async getDemoScenarios(): Promise<DemoScenario[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return surplusNetworkDemoService.getDemoScenarios();
    }

    // Get surplus inventory filtered by demo scenario
    async getSurplusInventoryByScenario(scenarioId: string): Promise<SurplusInventoryItem[]> {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (scenarioId === 'all') {
            return this.getSurplusInventory();
        }

        const scenarios = surplusNetworkDemoService.getDemoScenarios();
        const scenario = scenarios.find(s => s.id === scenarioId);

        if (scenario) {
            return scenario.items;
        }

        return [];
    }
}

// Export singleton instance
export const surplusNetworkService = new SurplusNetworkService();