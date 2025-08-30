import React, { useState } from 'react';
import SurplusInventoryListing from '../components/SurplusInventoryListing';
import { SurplusInventoryItem } from '../types/surplusNetwork';

const SurplusInventoryListingDemo: React.FC = () => {
    const [addedItems, setAddedItems] = useState<SurplusInventoryItem[]>([]);

    const handleItemAdded = (item: SurplusInventoryItem) => {
        setAddedItems(prev => [item, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Surplus Inventory Listing Demo
                    </h1>
                    <p className="text-gray-600">
                        Test the surplus inventory listing component functionality
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <SurplusInventoryListing onItemAdded={handleItemAdded} />
                    </div>

                    {/* Recently Added Items */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Recently Added Items ({addedItems.length})
                            </h3>

                            {addedItems.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    No items added yet. Use the form to add your first surplus inventory item.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {addedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">
                                                    {item.productName}
                                                </h4>
                                                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p><span className="font-medium">SKU:</span> {item.sku}</p>
                                                <p><span className="font-medium">Category:</span> {item.category}</p>
                                                <p><span className="font-medium">Quantity:</span> {item.quantityAvailable}</p>
                                                <p><span className="font-medium">Price:</span> ${item.unitPrice.toFixed(2)}</p>
                                                <p><span className="font-medium">Condition:</span> {item.condition}</p>
                                                <p><span className="font-medium">Location:</span> {item.location}</p>
                                                {item.expirationDate && (
                                                    <p><span className="font-medium">Expires:</span> {item.expirationDate.toLocaleDateString()}</p>
                                                )}
                                            </div>

                                            <div className="mt-2 text-xs text-gray-500">
                                                Added: {item.createdAt.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurplusInventoryListingDemo;