import { describe, it, expect, vi, beforeEach } from 'vitest';
import { surplusNetworkService } from '../../services/surplusNetworkService';
import { InventoryRequest } from '../../types/surplusNetwork';

describe('Request and Matching System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Request Creation', () => {
        it('should create a new inventory request', async () => {
            const mockRequest: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'> = {
                requesterId: 'test-user',
                surplusItemId: 'surplus-1',
                requestedQuantity: 5,
                urgencyLevel: 'medium',
                deliveryPreference: 'Standard shipping',
                notes: 'Test request',
                status: 'pending'
            };

            const result = await surplusNetworkService.createInventoryRequest(mockRequest);

            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.requesterId).toBe(mockRequest.requesterId);
            expect(result.surplusItemId).toBe(mockRequest.surplusItemId);
            expect(result.requestedQuantity).toBe(mockRequest.requestedQuantity);
            expect(result.status).toBe('pending');
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should handle request with different urgency levels', async () => {
            const urgencyLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];

            for (const urgency of urgencyLevels) {
                const mockRequest: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'> = {
                    requesterId: 'test-user',
                    surplusItemId: 'surplus-1',
                    requestedQuantity: 1,
                    urgencyLevel: urgency,
                    deliveryPreference: 'Standard shipping',
                    notes: `Test request with ${urgency} urgency`,
                    status: 'pending'
                };

                const result = await surplusNetworkService.createInventoryRequest(mockRequest);
                expect(result.urgencyLevel).toBe(urgency);
            }
        });
    });

    describe('Request Status Tracking', () => {
        it('should retrieve inventory requests', async () => {
            const requests = await surplusNetworkService.getInventoryRequests();

            expect(Array.isArray(requests)).toBe(true);
            expect(requests.length).toBeGreaterThan(0);

            // Check that each request has required properties
            requests.forEach(request => {
                expect(request.id).toBeDefined();
                expect(request.requesterId).toBeDefined();
                expect(request.surplusItemId).toBeDefined();
                expect(request.status).toMatch(/^(pending|accepted|rejected|completed)$/);
                expect(request.urgencyLevel).toMatch(/^(low|medium|high|critical)$/);
            });
        });

        it('should update request status', async () => {
            const requests = await surplusNetworkService.getInventoryRequests();
            if (requests.length > 0) {
                const requestId = requests[0].id;
                const result = await surplusNetworkService.updateRequestStatus(requestId, 'accepted');
                expect(result).toBe(true);
            }
        });
    });

    describe('Matching Logic', () => {
        it('should find available surplus items for matching', async () => {
            const surplusItems = await surplusNetworkService.getSurplusInventory();
            const availableItems = surplusItems.filter(item => item.status === 'available');

            expect(availableItems.length).toBeGreaterThan(0);

            // Verify items have sufficient quantity for potential matching
            availableItems.forEach(item => {
                expect(item.quantityAvailable).toBeGreaterThan(0);
                expect(item.status).toBe('available');
            });
        });

        it('should handle search and filtering for matching', async () => {
            const filters = {
                category: 'Electronics',
                location: 'San Francisco, CA'
            };

            const filteredItems = await surplusNetworkService.searchSurplusInventory(filters);

            expect(Array.isArray(filteredItems)).toBe(true);

            // Verify filtering works correctly
            filteredItems.forEach(item => {
                if (filters.category) {
                    expect(item.category.toLowerCase()).toContain(filters.category.toLowerCase());
                }
                if (filters.location) {
                    expect(item.location.toLowerCase()).toContain(filters.location.toLowerCase());
                }
            });
        });
    });

    describe('Integration Tests', () => {
        it('should complete full request workflow', async () => {
            // 1. Get available surplus items
            const surplusItems = await surplusNetworkService.getSurplusInventory();
            const availableItem = surplusItems.find(item => item.status === 'available');

            expect(availableItem).toBeDefined();

            if (availableItem) {
                // 2. Create a request for the item
                const mockRequest: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'> = {
                    requesterId: 'test-user',
                    surplusItemId: availableItem.id,
                    requestedQuantity: Math.min(5, availableItem.quantityAvailable),
                    urgencyLevel: 'medium',
                    deliveryPreference: 'Standard shipping',
                    notes: 'Integration test request',
                    status: 'pending'
                };

                const newRequest = await surplusNetworkService.createInventoryRequest(mockRequest);
                expect(newRequest.id).toBeDefined();
                expect(newRequest.status).toBe('pending');

                // 3. Verify request appears in request list
                const allRequests = await surplusNetworkService.getInventoryRequests();
                const foundRequest = allRequests.find(req => req.id === newRequest.id);
                expect(foundRequest).toBeDefined();

                // 4. Update request status to simulate matching
                const updateResult = await surplusNetworkService.updateRequestStatus(newRequest.id, 'accepted');
                expect(updateResult).toBe(true);
            }
        });
    });
});

// Export for use in other test files
export { };