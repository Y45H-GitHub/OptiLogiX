import { Button } from '@/components/ui/button';
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Play,
    Pause
} from 'lucide-react';

interface SupplyChainControlsProps {
    isAnimating: boolean;
    onToggleAnimation: () => void;
    onZoom: (delta: number) => void;
    onResetView: () => void;
    onResetNodePositions: () => void;
}

const SupplyChainControls = ({
    isAnimating,
    onToggleAnimation,
    onZoom,
    onResetView,
    onResetNodePositions
}: SupplyChainControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onToggleAnimation}
            >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onZoom(0.2)}>
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onZoom(-0.2)}>
                <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onResetView}>
                <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onResetNodePositions} title="Reset Node Positions">
                Reset Layout
            </Button>
        </div>
    );
};

export default SupplyChainControls;