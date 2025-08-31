import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, Store, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurplusInventoryItem } from '@/types/surplusNetwork';

interface MatchNotificationProps {
    matches?: SurplusInventoryItem[];
    category: string;
    onConnect: () => void;
    onDismiss: () => void;
}

const MatchNotification = ({ matches, category, onConnect, onDismiss }: MatchNotificationProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (matches && matches.length > 0) {
            setIsVisible(true);
            
            // Play notification sound
            const audio = new Audio('/beep.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            // Show toast notification
            toast.success(`Match found for ${category} items!`, {
                description: `${matches.length} items available from network partners`,
                duration: 5000
            });
        }
    }, [matches, category]);

    if (!isVisible || !matches || matches.length === 0) return null;

    // Group matches by participant/store
    const storeMatches: Record<string, SurplusInventoryItem[]> = {};
    matches.forEach(item => {
        if (!storeMatches[item.participantId]) {
            storeMatches[item.participantId] = [];
        }
        storeMatches[item.participantId].push(item);
    });

    const storeCount = Object.keys(storeMatches).length;
    const totalItems = matches.length;

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-green-200 overflow-hidden z-50 animate-slide-up">
            <div className="bg-green-50 p-3 flex items-center justify-between border-b border-green-200">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Match Found!</h3>
                </div>
                <button 
                    onClick={() => {
                        setIsVisible(false);
                        onDismiss();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="p-3">
                <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{totalItems} {category} items</span> found across {storeCount} store{storeCount !== 1 ? 's' : ''}!
                </p>
                
                <div className="max-h-32 overflow-y-auto mb-3 text-xs text-gray-600">
                    {Object.entries(storeMatches).map(([storeId, items]) => (
                        <div key={storeId} className="flex items-center gap-1 mb-1">
                            <Store className="w-3 h-3 flex-shrink-0" />
                            <span>Store {storeId.slice(-4)}: {items.length} items available</span>
                        </div>
                    ))}
                </div>
                
                <Button 
                    onClick={() => {
                        setIsVisible(false);
                        onConnect();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                    Connect with Stores
                    <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
            
            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MatchNotification;