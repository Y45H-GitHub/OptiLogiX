import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Zap,
    Truck,
    MapPin,
    Clock,
    Activity,
    Wifi,
    CheckCircle
} from 'lucide-react';
import { BecknTrackingData } from '@/types/logistics';
import { becknDemoService } from '@/services/becknDemoService';

interface BecknLiveIndicatorProps {
    becknData?: BecknTrackingData | null;
    className?: string;
    variant?: 'compact' | 'detailed' | 'banner';
}

/**
 * BECKN Live Tracking Indicator Component
 * Provides visual indicators showing "Live BECKN Tracking" status
 * Implements task 7: Add visual indicators showing "Live BECKN Tracking" status
 */
const BecknLiveIndicator: React.FC<BecknLiveIndicatorProps> = ({
    becknData,
    className = '',
    variant = 'compact'
}) => {
    const isDemoMode = becknDemoService.isDemoModeActive();
    const isLiveTracking = becknData !== null;

    if (!isLiveTracking) {
        return null;
    }

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    // Compact variant - just a badge
    if (variant === 'compact') {
        return (
            <Badge className={`bg-green-100 text-green-800 font-medium ${className}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {isDemoMode ? 'BECKN Demo Live' : 'BECKN Live'}
            </Badge>
        );
    }

    // Banner variant - full width status bar
    if (variant === 'banner') {
        return (
            <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Wifi className="w-5 h-5 text-green-600" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <span className="font-semibold text-green-900">
                                {isDemoMode ? 'BECKN Demo Tracking Active' : 'Live BECKN Tracking Active'}
                            </span>
                        </div>

                        {becknData?.deliveryPartner && (
                            <Badge className="bg-blue-100 text-blue-800">
                                <Truck className="w-3 h-3 mr-1" />
                                {becknData.deliveryPartner.name}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-green-700">
                        {becknData?.currentLocation && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>Location: {formatTimeAgo(becknData.currentLocation.timestamp)}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>Updated: {formatTimeAgo(becknData?.lastUpdated || new Date().toISOString())}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Detailed variant - card with comprehensive status
    return (
        <Card className={`bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ${className}`}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Zap className="w-5 h-5 text-green-600" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="font-semibold text-green-900">
                                {isDemoMode ? 'BECKN Demo Tracking' : 'Live BECKN Tracking'}
                            </h3>
                        </div>

                        <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Current Status */}
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Status</span>
                            </div>
                            <p className="text-green-700 font-semibold capitalize">
                                {becknData?.status?.replace('_', ' ') || 'Active'}
                            </p>
                        </div>

                        {/* Location Status */}
                        {becknData?.currentLocation && (
                            <div className="bg-white rounded-lg p-3 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-3 h-3 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">Location</span>
                                </div>
                                <p className="text-orange-700 font-semibold">
                                    {formatTimeAgo(becknData.currentLocation.timestamp)}
                                </p>
                            </div>
                        )}

                        {/* Partner Status */}
                        {becknData?.deliveryPartner && (
                            <div className="bg-white rounded-lg p-3 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <Truck className="w-3 h-3 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Partner</span>
                                </div>
                                <p className="text-blue-700 font-semibold">
                                    {becknData.deliveryPartner.name}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Demo Mode Notice */}
                    {isDemoMode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                <Activity className="w-4 h-4" />
                                <span>
                                    Demo mode active with live location simulation and realistic tracking data
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Last Update */}
                    <div className="flex items-center justify-between text-xs text-green-600 pt-2 border-t border-green-200">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Last updated: {formatTimeAgo(becknData?.lastUpdated || new Date().toISOString())}</span>
                        </div>

                        {becknData?.becknTransactionId && (
                            <span className="font-mono">
                                ID: {becknData.becknTransactionId.slice(-8)}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BecknLiveIndicator;