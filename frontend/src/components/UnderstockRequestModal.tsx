import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    X,
    Package,
    AlertTriangle,
    Clock,
    Loader2
} from 'lucide-react';
import { smartActionsService } from '@/services/smartActionsService';
import { toast } from 'sonner';

interface UnderstockRequestModalProps {
    category: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const UnderstockRequestModal = ({ category, isOpen, onClose, onSuccess }: UnderstockRequestModalProps) => {
    const [quantity, setQuantity] = useState(5);
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const result = await smartActionsService.createUnderstockRequest(
                category,
                quantity,
                urgency
            );

            if (result.success) {
                toast.success(result.message);
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Request {category} Items
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">Understock Detected</span>
                        </div>
                        <p className="text-sm text-orange-700">
                            Current demand for {category} items exceeds available supply.
                            Create a request to find items from network partners.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity Needed
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency Level
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setUrgency(level)}
                                    className={`p-2 text-sm rounded-md border-2 transition-colors ${urgency === level
                                            ? getUrgencyColor(level)
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-1 justify-center">
                                        {level === 'critical' && <AlertTriangle className="w-3 h-3" />}
                                        {level === 'high' && <Clock className="w-3 h-3" />}
                                        <span className="capitalize">{level}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Specify any particular requirements or preferences..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Request'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UnderstockRequestModal;