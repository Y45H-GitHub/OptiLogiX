import React, { useState } from 'react';
import { X, Package, User, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SurplusInventoryItem, InventoryRequest } from '@/types/surplusNetwork';

interface RequestItemModalProps {
    item: SurplusInventoryItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const RequestItemModal: React.FC<RequestItemModalProps> = ({
    item,
    isOpen,
    onClose,
    onSubmit
}) => {
    const [requestedQuantity, setRequestedQuantity] = useState<number>(1);
    const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [deliveryPreference, setDeliveryPreference] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !item) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (requestedQuantity <= 0 || requestedQuantity > item.quantityAvailable) {
            return;
        }

        setIsSubmitting(true);

        const request: Omit<InventoryRequest, 'id' | 'createdAt' | 'updatedAt'> = {
            requesterId: 'current-user', // In real app, this would come from auth context
            surplusItemId: item.id,
            requestedQuantity,
            urgencyLevel,
            deliveryPreference: deliveryPreference || 'Standard shipping',
            notes,
            status: 'pending'
        };

        try {
            await onSubmit(request);
            // Reset form
            setRequestedQuantity(1);
            setUrgencyLevel('medium');
            setDeliveryPreference('');
            setNotes('');
            onClose();
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const totalCost = requestedQuantity * item.unitPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Request Item</h2>
                            <p className="text-sm text-gray-600">Submit a request for surplus inventory</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Item Details */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start space-x-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {item.productName}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">SKU:</span>
                                    <span className="ml-2 font-medium">{item.sku}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Available:</span>
                                    <span className="ml-2 font-medium">{item.quantityAvailable} units</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Unit Price:</span>
                                    <span className="ml-2 font-medium">{formatPrice(item.unitPrice)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Location:</span>
                                    <span className="ml-2 font-medium">{item.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Request Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Quantity */}
                    <div className="space-y-2">
                        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                            Requested Quantity *
                        </label>
                        <div className="flex items-center space-x-4">
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={item.quantityAvailable}
                                value={requestedQuantity}
                                onChange={(e) => setRequestedQuantity(parseInt(e.target.value) || 1)}
                                className="w-32"
                                required
                            />
                            <span className="text-sm text-gray-600">
                                of {item.quantityAvailable} available
                            </span>
                        </div>
                        {requestedQuantity > item.quantityAvailable && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Quantity exceeds available inventory</span>
                            </p>
                        )}
                    </div>

                    {/* Urgency Level */}
                    <div className="space-y-2">
                        <label htmlFor="urgency" className="text-sm font-medium text-gray-700">
                            Urgency Level *
                        </label>
                        <Select value={urgencyLevel} onValueChange={(value: any) => setUrgencyLevel(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Low - Standard processing</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Medium - Priority processing</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="high">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>High - Urgent need</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="critical">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Critical - Immediate need</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Delivery Preference */}
                    <div className="space-y-2">
                        <label htmlFor="delivery" className="text-sm font-medium text-gray-700">
                            Delivery Preference
                        </label>
                        <Input
                            id="delivery"
                            value={deliveryPreference}
                            onChange={(e) => setDeliveryPreference(e.target.value)}
                            placeholder="e.g., Standard shipping, Express delivery, Pickup preferred"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                            Additional Notes
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional information about your request..."
                            rows={3}
                        />
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Estimated Total Cost:</span>
                            <span className="text-xl font-bold text-emerald-700">
                                {formatPrice(totalCost)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {requestedQuantity} units × {formatPrice(item.unitPrice)} per unit
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || requestedQuantity <= 0 || requestedQuantity > item.quantityAvailable}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>Submit Request</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestItemModal;