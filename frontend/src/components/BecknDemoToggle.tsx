import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Zap,
    ZapOff,
    Truck,
    MapPin,
    Clock,
    Activity,
    Settings
} from 'lucide-react';
import { becknDemoService } from '@/services/becknDemoService';

interface BecknDemoToggleProps {
    onToggle?: (isDemoMode: boolean) => void;
    className?: string;
}

/**
 * BECKN Demo Toggle Component
 * Provides toggle functionality to switch between BECKN and regular tracking
 * Implements task 7: Add toggle button to switch between BECKN and regular tracking
 */
const BecknDemoToggle: React.FC<BecknDemoToggleProps> = ({ onToggle, className = '' }) => {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoStats, setDemoStats] = useState({
        activeSimulations: 0,
        cachedOrders: [] as string[]
    });

    useEffect(() => {
        // Initialize demo mode state
        setIsDemoMode(becknDemoService.isDemoModeActive());
        updateDemoStats();

        // Update stats periodically when demo mode is active
        const statsInterval = setInterval(() => {
            if (becknDemoService.isDemoModeActive()) {
                updateDemoStats();
            }
        }, 5000);

        return () => clearInterval(statsInterval);
    }, []);

    const updateDemoStats = () => {
        const stats = becknDemoService.getDemoStatusInfo();
        setDemoStats({
            activeSimulations: stats.activeSimulations,
            cachedOrders: stats.cachedOrders
        });
    };

    const handleToggle = () => {
        const newDemoMode = becknDemoService.toggleDemoMode();
        setIsDemoMode(newDemoMode);
        updateDemoStats();

        if (onToggle) {
            onToggle(newDemoMode);
        }
    };

    return (
        <Card className={`${className} ${isDemoMode ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    {/* Toggle Button and Status */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleToggle}
                            variant={isDemoMode ? "default" : "outline"}
                            size="sm"
                            className={isDemoMode ?
                                "bg-blue-600 hover:bg-blue-700 text-white" :
                                "border-gray-300 hover:bg-gray-100"
                            }
                        >
                            {isDemoMode ? (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Demo Mode ON
                                </>
                            ) : (
                                <>
                                    <ZapOff className="w-4 h-4 mr-2" />
                                    Demo Mode OFF
                                </>
                            )}
                        </Button>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                            {isDemoMode ? (
                                <Badge className="bg-green-100 text-green-800 font-medium">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Live BECKN Demo
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-600">
                                    <Settings className="w-3 h-3 mr-1" />
                                    Regular Mode
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Demo Stats (when active) */}
                    {isDemoMode && (
                        <div className="flex items-center gap-4 text-sm">
                            {demoStats.activeSimulations > 0 && (
                                <div className="flex items-center gap-1 text-blue-700">
                                    <Activity className="w-4 h-4" />
                                    <span>{demoStats.activeSimulations} live simulation{demoStats.activeSimulations !== 1 ? 's' : ''}</span>
                                </div>
                            )}

                            {demoStats.cachedOrders.length > 0 && (
                                <div className="flex items-center gap-1 text-indigo-700">
                                    <Truck className="w-4 h-4" />
                                    <span>{demoStats.cachedOrders.length} demo order{demoStats.cachedOrders.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Demo Mode Description */}
                {isDemoMode && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-start gap-2 text-sm text-blue-800">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">BECKN Demo Mode Active</p>
                                <p className="text-blue-700 mt-1">
                                    Enhanced tracking with live location simulation, realistic delivery partner data,
                                    and real-time status updates. Try tracking orders ORD-001, ORD-002, ORD-003, or ORD-004.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Regular Mode Description */}
                {!isDemoMode && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Regular Tracking Mode</p>
                                <p className="text-gray-500 mt-1">
                                    Standard order tracking with basic logistics data.
                                    Enable demo mode to experience enhanced BECKN protocol features.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BecknDemoToggle;