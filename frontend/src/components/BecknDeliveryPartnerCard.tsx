import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Phone,
    Mail,
    Car,
    Star,
    MessageCircle
} from 'lucide-react';
import { BecknDeliveryPartner } from '@/types/logistics';

interface BecknDeliveryPartnerCardProps {
    deliveryPartner: BecknDeliveryPartner;
    className?: string;
}

/**
 * BECKN Delivery Partner Card Component
 * Displays delivery partner information from BECKN protocol
 * Implements requirements 2.1 and 2.2: Show partner details and contact options
 */
export const BecknDeliveryPartnerCard: React.FC<BecknDeliveryPartnerCardProps> = ({
    deliveryPartner,
    className = ''
}) => {
    const handleCallPartner = () => {
        window.open(`tel:${deliveryPartner.phone}`, '_self');
    };

    const handleEmailPartner = () => {
        if (deliveryPartner.email) {
            window.open(`mailto:${deliveryPartner.email}`, '_self');
        }
    };

    const handleSmsPartner = () => {
        window.open(`sms:${deliveryPartner.phone}`, '_self');
    };

    const formatRating = (rating: number) => {
        return rating.toFixed(1);
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 4.0) return 'text-blue-600';
        if (rating >= 3.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        Delivery Partner
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 font-medium">
                        BECKN Enabled
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Partner Info */}
                <div className="flex items-start gap-4">
                    {deliveryPartner.photo ? (
                        <img
                            src={deliveryPartner.photo}
                            alt={deliveryPartner.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    )}

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                            {deliveryPartner.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1">
                            <Star className={`w-4 h-4 fill-current ${getRatingColor(deliveryPartner.rating)}`} />
                            <span className={`font-medium ${getRatingColor(deliveryPartner.rating)}`}>
                                {formatRating(deliveryPartner.rating)}
                            </span>
                            <span className="text-gray-500 text-sm">rating</span>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-100 rounded-full">
                            <Phone className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">{deliveryPartner.phone}</span>
                    </div>

                    {deliveryPartner.email && (
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-purple-100 rounded-full">
                                <Mail className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <span className="text-gray-700">{deliveryPartner.email}</span>
                        </div>
                    )}
                </div>

                {/* Vehicle Information */}
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Vehicle Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-600">Type</p>
                            <p className="font-medium text-gray-900">{deliveryPartner.vehicle.type}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Number</p>
                            <p className="font-medium text-gray-900">{deliveryPartner.vehicle.number}</p>
                        </div>
                        {deliveryPartner.vehicle.model && (
                            <div className="col-span-2">
                                <p className="text-gray-600">Model</p>
                                <p className="font-medium text-gray-900">{deliveryPartner.vehicle.model}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleCallPartner}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                    </Button>

                    <Button
                        onClick={handleSmsPartner}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        SMS
                    </Button>

                    {deliveryPartner.email && (
                        <Button
                            onClick={handleEmailPartner}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BecknDeliveryPartnerCard;