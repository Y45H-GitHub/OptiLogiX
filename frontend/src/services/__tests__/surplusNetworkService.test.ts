import { surplusNetworkService } from '../surplusNetworkService';
import { InventoryFilters } from '../../types/surplusNetwork';

describe('SurplusNetworkService', () => {
    test('should return surplus inventory items', async () => {
        const items = await surplusNetworkService.getSurplusInventory();
        expect(items).toBeDefined();
        expect(items.length).toBeGreaterThan(0);
        expect(items[0]).toHaveProperty('id');
        expect(items[0]).toHaveProperty('productName');
        expect(items[0]).toHaveProperty('category');
    });

    test('should filter surplus inventory by category', async () => {
        const filters: InventoryFilters = { category: 'Electronics' };
        const items = await surplusNetworkService.searchSurplusInventory(filters);
        expect(items).toBeDefined();
        expect(items.every(item => item.category === 'Electronics')).toBe(true);
    });

    test('should add new surplus item', async () => {
        const newItem = {
            participantId: 'test-participant',
            sku: 'TEST-001',
            productName: 'Test Product',
            description: 'Test description',
            category: 'Test Category',
            quantityAvailable: 10,
            unitPrice: 100.00,
            condition: 'new' as const,
            location: 'Test Location',
            images: [],
            status: 'available' as const
        };

        const addedItem = await surplusNetworkService.addSurplusItem(newItem);
        expect(addedItem).toBeDefined();
        expect(addedItem.id).toBeDefined();
        expect(addedItem.productName).toBe('Test Product');
        expect(addedItem.createdAt).toBeDefined();
    });

    test('should create inventory request', async () => {
        const newRequest = {
            requesterId: 'test-requester',
            surplusItemId: 'surplus-1',
            requestedQuantity: 5,
            urgencyLevel: 'medium' as const,
            deliveryPreference: 'Standard shipping',
            notes: 'Test request',
            status: 'pending' as const
        };

        const addedRequest = await surplusNetworkService.createInventoryRequest(newRequest);
        expect(addedRequest).toBeDefined();
        expect(addedRequest.id).toBeDefined();
        expect(addedRequest.requestedQuantity).toBe(5);
        expect(addedRequest.createdAt).toBeDefined();
    });

    test('should return network analytics', async () => {
        const analytics = await surplusNetworkService.getNetworkAnalytics();
        expect(analytics).toBeDefined();
        expect(analytics.totalItemsShared).toBeGreaterThan(0);
        expect(analytics.monthlyTrends).toBeDefined();
        expect(analytics.monthlyTrends.length).toBeGreaterThan(0);
    });
});