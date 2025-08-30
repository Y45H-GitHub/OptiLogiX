// Verification script for surplus network service
import { surplusNetworkService } from './surplusNetworkService';
import { SurplusInventoryItem, InventoryRequest } from '../types/surplusNetwork';

// This file verifies that the service and types work correctly
async function verifySurplusNetworkService() {
    console.log('Verifying Surplus Network Service...');

    try {
        // Test getting surplus inventory
        const inventory = await surplusNetworkService.getSurplusInventory();
        console.log(`✓ Retrieved ${inventory.length} surplus inventory items`);

        // Test search functionality
        const electronicsItems = await surplusNetworkService.searchSurplusInventory({
            category: 'Electronics'
        });
        console.log(`✓ Found ${electronicsItems.length} electronics items`);

        // Test getting requests
        const requests = await surplusNetworkService.getInventoryRequests();
        console.log(`✓ Retrieved ${requests.length} inventory requests`);

        // Test analytics
        const analytics = await surplusNetworkService.getNetworkAnalytics();
        console.log(`✓ Retrieved analytics with ${analytics.totalItemsShared} items shared`);

        console.log('✓ All service methods working correctly!');
        return true;
    } catch (error) {
        console.error('✗ Service verification failed:', error);
        return false;
    }
}

// Export for potential use
export { verifySurplusNetworkService };