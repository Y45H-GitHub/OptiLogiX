interface SupplyChainOverlaysProps {
    zoomLevel: number;
    isDragging: boolean;
}

const SupplyChainOverlays = ({ zoomLevel, isDragging }: SupplyChainOverlaysProps) => {
    return (
        <>
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-sm">
                <h4 className="font-semibold text-sm mb-2">Carbon Levels</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Low (&lt;2 kg CO₂)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium (2-4 kg CO₂)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>High (&gt;4 kg CO₂)</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-sm text-xs">
                <div className="font-semibold mb-1">Instructions:</div>
                <div>• Click to select nodes</div>
                <div>• Drag nodes to move them</div>
                <div>• Connections stay intact</div>
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
                Zoom: {Math.round(zoomLevel * 100)}%
                {isDragging && <span className="ml-2 text-purple-600">Dragging...</span>}
            </div>
        </>
    );
};

export default SupplyChainOverlays;