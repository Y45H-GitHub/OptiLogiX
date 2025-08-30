import { Button } from '@/components/ui/button';

interface SupplyChainFiltersProps {
    filters: {
        showSuppliers: boolean;
        showProducts: boolean;
        showStores: boolean;
        showDonations: boolean;
        carbonThreshold: number;
    };
    onToggleFilter: (filterKey: keyof typeof filters) => void;
}

const SupplyChainFilters = ({ filters, onToggleFilter }: SupplyChainFiltersProps) => {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Button
                variant={filters.showSuppliers ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFilter('showSuppliers')}
            >
                🏭 Suppliers
            </Button>
            <Button
                variant={filters.showProducts ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFilter('showProducts')}
            >
                📦 Products
            </Button>
            <Button
                variant={filters.showStores ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFilter('showStores')}
            >
                🏪 Stores
            </Button>
            <Button
                variant={filters.showDonations ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFilter('showDonations')}
            >
                ❤️ Donations
            </Button>
        </div>
    );
};

export default SupplyChainFilters;