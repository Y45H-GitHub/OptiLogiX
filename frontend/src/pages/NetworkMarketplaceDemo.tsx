import React from 'react';
import NetworkMarketplace from '@/components/NetworkMarketplace';
import { SurplusInventoryItem } from '@/types/surplusNetwork';

const NetworkMarketplaceDemo: React.FC = () => {
    const handleRequestItem = (item: SurplusInventoryItem) => {
        console.log('Item requested:', item);
        // In a real app, this would open a request modal or navigate to a request form
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <NetworkMarketplace onRequestItem={handleRequestItem} />
        </div>
    );
};

export default NetworkMarketplaceDemo;