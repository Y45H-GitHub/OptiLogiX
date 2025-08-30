import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Package, DollarSign, MapPin, Calendar, FileText } from 'lucide-react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Toast from '@/components/Toast';
import { surplusNetworkService } from '@/services/surplusNetworkService';
import { SurplusInventoryItem } from '@/types/surplusNetwork';

// Form validation schema
const surplusInventorySchema = z.object({
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
    productName: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
    category: z.string().min(1, 'Category is required'),
    quantityAvailable: z.number().min(1, 'Quantity must be at least 1').max(10000, 'Quantity must be less than 10,000'),
    unitPrice: z.number().min(0.01, 'Price must be greater than $0.01').max(999999.99, 'Price must be less than $1,000,000'),
    condition: z.enum(['new', 'like_new', 'good', 'fair'], {
        required_error: 'Please select a condition',
    }),
    location: z.string().min(1, 'Location is required').max(255, 'Location must be less than 255 characters'),
    expirationDate: z.string().optional(),
});

type SurplusInventoryFormData = z.infer<typeof surplusInventorySchema>;

// Available categories for surplus items
const CATEGORIES = [
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

// Condition options with descriptions
const CONDITIONS = [
    { value: 'new', label: 'New', description: 'Brand new, never used' },
    { value: 'like_new', label: 'Like New', description: 'Minimal use, excellent condition' },
    { value: 'good', label: 'Good', description: 'Used but in good working condition' },
    { value: 'fair', label: 'Fair', description: 'Shows wear but still functional' },
] as const;

interface SurplusInventoryListingProps {
    onItemAdded?: (item: SurplusInventoryItem) => void;
}

const SurplusInventoryListing: React.FC<SurplusInventoryListingProps> = ({ onItemAdded }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const form = useForm<SurplusInventoryFormData>({
        resolver: zodResolver(surplusInventorySchema),
        defaultValues: {
            sku: '',
            productName: '',
            description: '',
            category: '',
            quantityAvailable: 1,
            unitPrice: 0,
            condition: 'new',
            location: '',
            expirationDate: '',
        },
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const onSubmit = async (data: SurplusInventoryFormData) => {
        setIsSubmitting(true);

        try {
            // Convert form data to SurplusInventoryItem format
            const itemData = {
                participantId: 'current-user', // This would come from auth context in real app
                sku: data.sku,
                productName: data.productName,
                description: data.description,
                category: data.category,
                quantityAvailable: data.quantityAvailable,
                unitPrice: data.unitPrice,
                condition: data.condition,
                location: data.location,
                expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
                images: [], // Image upload would be implemented separately
                status: 'available' as const,
            };

            // Add item to mock data store
            const newItem = await surplusNetworkService.addSurplusItem(itemData);

            // Show success message
            showToast('Surplus inventory item added successfully!', 'success');

            // Reset form
            form.reset();

            // Notify parent component
            if (onItemAdded) {
                onItemAdded(newItem);
            }

        } catch (error) {
            console.error('Error adding surplus item:', error);
            showToast('Failed to add surplus item. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">List Surplus Inventory</h2>
                            <p className="text-gray-600 mt-1">
                                Add your surplus inventory to the rescue network and help other businesses find what they need.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                    <span>Basic Information</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* SKU */}
                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU / Product Code</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., LAPTOP-DEL-001"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Unique identifier for this product
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Product Name */}
                                    <FormField
                                        control={form.control}
                                        name="productName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Dell Latitude 5520 Laptops"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Clear, descriptive product name
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide detailed information about the product, including specifications, condition details, and any relevant notes..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Detailed description to help potential recipients understand the product
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Category and Condition */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {CATEGORIES.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Product category for easier discovery
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="condition"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Condition</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select condition" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {CONDITIONS.map((condition) => (
                                                            <SelectItem key={condition.value} value={condition.value}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{condition.label}</span>
                                                                    <span className="text-xs text-gray-500">{condition.description}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Current condition of the items
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Quantity and Pricing Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    <span>Quantity & Pricing</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Quantity */}
                                    <FormField
                                        control={form.control}
                                        name="quantityAvailable"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity Available</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="10000"
                                                        placeholder="e.g., 25"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Number of units available
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Unit Price */}
                                    <FormField
                                        control={form.control}
                                        name="unitPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        max="999999.99"
                                                        step="0.01"
                                                        placeholder="e.g., 650.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Price per unit in USD
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Location and Expiration Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                    <span>Location & Details</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Location */}
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., San Francisco, CA"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    City and state where items are located
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Expiration Date (Optional) */}
                                    <FormField
                                        control={form.control}
                                        name="expirationDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiration Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave blank if items don't expire
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding Item...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add to Network
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

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

export default SurplusInventoryListing;