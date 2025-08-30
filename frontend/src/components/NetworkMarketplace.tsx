import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Package, DollarSign, Calendar, Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Toast from '@/components/Toast';
import RequestItemModal from '@/components/RequestItemModal';
import { surplusNetworkService } from '@/services/surplusNetworkService';
import { SurplusInventoryItem, InventoryFilters, InventoryRequest } from '@/types/surplusNetwork';

// Available categories for filtering
const CATEGORIES = [
    'All Categories',
    'Electronics',
    'Office Supplies',
    'Seasonal',
    'Furniture',
    'Industrial Equipment',
    'Medical Supplies',
    'Automotive Parts',
    'Construction Materials',
    'Food & Beverage',
    'Textiles & Apparel',
    'Other'
];

// Condition options for filtering
const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
];

interface NetworkMarketplaceProps {
    onRequestItem?: (item: SurplusInventoryItem) => void;
    onRequestSubmitted?: (request: InventoryRequest) => void;
}

const NetworkMarketplace: React.FC<NetworkMarketplaceProps> = ({ onRequestItem, onRequestSubmitted }) => {
    const [items, setItems] = useState<SurplusInventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<SurplusInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SurplusInventoryItem | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Load initial data
    useEffect(() => {
        loadSurplusInventory();
    }, []);

    // Apply filters when search criteria change
    useEffect(() => {
        applyFilters();
    }, [items, searchTerm, selectedCategory, selectedLocation, selectedConditions]);

    const loadSurplusInventory = async () => {
        try {
            setLoading(true);
            const data = await surplusNetworkService.getSurplusInventory();
            setItems(data);
        } catch (error) {
            console.error('Error loading surplus inventory:', error);
            showToast('Failed to load inventory. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        try {
            const filters: InventoryFilters = {
                searchTerm: searchTerm || undefined,
                category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
                location: selectedLocation || undefined,
                condition: selectedConditions.length > 0 ? selectedConditions : undefined,
            };

            const filtered = await surplusNetworkService.searchSurplusInventory(filters);
            setFilteredItems(filtered);
        } catch (error) {
            console.error('Error filtering inventory:', error);
            showToast('Error applying filters. Please try again.', 'error');
        }
    };

    const handleRequestItem = (item: SurplusInventoryItem) => {
        setSelectedItem(item);
        setIsRequestModalOpen(true);
        if (onRequestItem) {
            onRequestItem(item);
        }
    };

    const handleRequestSubmit = async (request: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const newRequest = await surplusNetworkService.createInventoryRequest(request);

            // Show instant match notification
            showToast('Match Found! Your request has been submitted successfully.', 'success');

            // Simulate matching notification after a short delay
            setTimeout(() => {
                showToast(`Great news! A supplier is available for ${selectedItem?.productName}. You'll be contacted soon!`, 'info');
            }, 2000);

            if (onRequestSubmitted) {
                onRequestSubmitted(newRequest);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            showToast('Failed to submit request. Please try again.', 'error');
        }
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        setSelectedItem(null);
    };

    const handleConditionToggle = (condition: string) => {
        setSelectedConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('All Categories');
        setSelectedLocation('');
        setSelectedConditions([]);
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const getConditionBadgeColor = (condition: string) => {
        switch (condition) {
            case 'new':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'like_new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'good':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'fair':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Get unique locations for filter dropdown
    const uniqueLocations = Array.from(new Set(items.map(item => item.location))).sort();

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Network Marketplace</h1>
                        <p className="text-gray-600 mt-1">
                            Discover available surplus inventory from network participants
                        </p>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search products, SKUs, or descriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="w-full lg:w-48">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location Filter */}
                        <div className="w-full lg:w-48">
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Locations</SelectItem>
                                    {uniqueLocations.map((location) => (
                                        <SelectItem key={location} value={location}>
                                            {location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4">
                                {/* Condition Filters */}
                                <div className="flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Condition</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CONDITIONS.map((condition) => (
                                            <Button
                                                key={condition.value}
                                                variant={selectedConditions.includes(condition.value) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleConditionToggle(condition.value)}
                                                className="text-xs"
                                            >
                                                {condition.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
                <p className="text-gray-600">
                    {loading ? 'Loading...' : `${filteredItems.length} items available`}
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            )}

            {/* No Results */}
            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your search criteria or filters to find more items.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Inventory Grid */}
            {!loading && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg text-gray-800 mb-1">
                                            {item.productName}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                                        <Badge className={`text-xs ${getConditionBadgeColor(item.condition)}`}>
                                            {item.condition.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {formatPrice(item.unitPrice)}
                                        </div>
                                        <div className="text-sm text-gray-500">per unit</div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Description */}
                                <p className="text-sm text-gray-700 line-clamp-3">
                                    {item.description}
                                </p>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Package className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span>{item.quantityAvailable} units available</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span>{item.location}</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Star className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span>{item.category}</span>
                                    </div>

                                    {item.expirationDate && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                                            <span>Expires: {formatDate(item.expirationDate)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total Value */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Total Value:</span>
                                        <span className="text-lg font-bold text-emerald-700">
                                            {formatPrice(item.unitPrice * item.quantityAvailable)}
                                        </span>
                                    </div>
                                </div>

                                {/* Request Button */}
                                <Button
                                    onClick={() => handleRequestItem(item)}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Request Item</span>
                                </Button>

                                {/* Metadata */}
                                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                    Listed on {formatDate(item.createdAt)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Request Item Modal */}
            <RequestItemModal
                item={selectedItem}
                isOpen={isRequestModalOpen}
                onClose={handleCloseRequestModal}
                onSubmit={handleRequestSubmit}
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default NetworkMarketplace;