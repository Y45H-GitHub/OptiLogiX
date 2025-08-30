import { Badge } from '@/components/ui/badge';
import { NetworkNode } from '@/types/digitalTwin';

interface SupplyChainNodeDetailsProps {
    selectedNode: NetworkNode | null;
}

const SupplyChainNodeDetails = ({ selectedNode }: SupplyChainNodeDetailsProps) => {
    const getNodeIcon = (type: string): string => {
        switch (type) {
            case 'supplier': return '🏭';
            case 'product': return '📦';
            case 'store': return '🏪';
            case 'donation': return '❤️';
            default: return '●';
        }
    };

    if (!selectedNode) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getNodeIcon(selectedNode.type)}</span>
                <h3 className="font-semibold">{selectedNode.name}</h3>
                <Badge variant="outline" className="text-xs">
                    {selectedNode.type}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-600">Carbon Level:</span>
                    <span className="ml-2 font-medium">
                        {selectedNode.carbonLevel > 0
                            ? `${selectedNode.carbonLevel.toFixed(1)} kg CO₂`
                            : `${Math.abs(selectedNode.carbonLevel).toFixed(1)} kg CO₂ saved`
                        }
                    </span>
                </div>
                <div>
                    <span className="text-gray-600">Connections:</span>
                    <span className="ml-2 font-medium">{selectedNode.connections.length}</span>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainNodeDetails;