import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { digitalTwinService } from '@/services/digitalTwinService';
import { InteractiveGraph, NetworkNode, NetworkEdge, SupplyChainNode, SupplyChainConnection } from '@/types/digitalTwin';
import { useSupplyChainInteractions } from '@/hooks/useSupplyChainInteractions';
import SupplyChainCanvas from './SupplyChainCanvas';
import SupplyChainControls from './SupplyChainControls';
import SupplyChainFilters from './SupplyChainFilters';
import SupplyChainOverlays from './SupplyChainOverlays';
import SupplyChainNodeDetails from './SupplyChainNodeDetails';

interface InteractiveSupplyChainGraphProps {
    nodes?: SupplyChainNode[];
    connections?: SupplyChainConnection[];
    onNodeSelect?: (node: SupplyChainNode) => void;
    selectedNode?: SupplyChainNode | null;
    onNodeClick?: (node: NetworkNode) => void;
}

const InteractiveSupplyChainGraph = ({
    nodes,
    connections,
    onNodeSelect,
    selectedNode: externalSelectedNode,
    onNodeClick
}: InteractiveSupplyChainGraphProps) => {
    const [graphData, setGraphData] = useState<InteractiveGraph | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAnimating, setIsAnimating] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [filters, setFilters] = useState({
        showSuppliers: true,
        showProducts: true,
        showStores: true,
        showDonations: true,
        carbonThreshold: 0
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    const {
        isDragging,
        draggedNode,
        hoveredNode,
        selectedNode: internalSelectedNode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleCanvasClick
    } = useSupplyChainInteractions({
        graphData,
        zoomLevel,
        onNodeSelect,
        onNodeClick
    });

    // Use external selected node if provided, otherwise use internal
    const selectedNode = externalSelectedNode ?
        graphData?.nodes.find(n => n.metadata?.id === externalSelectedNode.id) || null :
        internalSelectedNode;

    useEffect(() => {
        if (nodes && connections) {
            convertExternalData();
        } else {
            loadGraphData();
        }
    }, [nodes, connections]);

    useEffect(() => {
        if (isAnimating) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating]);

    const convertExternalData = () => {
        if (!nodes || !connections) return;

        setLoading(true);

        const networkNodes: NetworkNode[] = nodes.map((node, index) => ({
            id: node.id,
            type: node.type === 'supplier' ? 'supplier' : 'store',
            name: node.name,
            position: {
                x: 100 + (index % 4) * 180,
                y: 100 + Math.floor(index / 4) * 150
            },
            carbonLevel: node.type === 'supplier' ? 3.0 : (100 - (node.metrics?.efficiency || 0.5) * 100),
            size: Math.max(20, (node.capacity.current / 1000)),
            connections: [],
            metadata: node
        }));

        const networkEdges: NetworkEdge[] = connections.map(conn => ({
            id: conn.id,
            source: conn.source,
            target: conn.target,
            type: conn.type === 'distribution' ? 'transport' : conn.type as 'supply' | 'transport',
            weight: conn.flow,
            carbonFlow: conn.carbonEmission,
            animated: conn.status === 'active',
            color: conn.carbonEmission > 50 ? '#EF4444' : conn.carbonEmission > 20 ? '#F97316' : '#10B981'
        }));

        const convertedData: InteractiveGraph = {
            nodes: networkNodes,
            edges: networkEdges,
            layout: 'force',
            filters: {
                showSuppliers: true,
                showProducts: true,
                showStores: true,
                showDonations: true,
                carbonThreshold: 0
            }
        };

        setGraphData(convertedData);
        setLoading(false);
    };

    const loadGraphData = async () => {
        try {
            setLoading(true);
            const data = await digitalTwinService.generateInteractiveGraph();
            setGraphData(data);
        } catch (error) {
            console.error('Error loading graph data:', error);
        } finally {
            setLoading(false);
        }
    };

    const animate = () => {
        if (isAnimating) {
            animationRef.current = requestAnimationFrame(animate);
        }
    };



    const handleZoom = (delta: number) => {
        setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const resetView = () => {
        setZoomLevel(1);
    };

    const resetNodePositions = () => {
        if (!graphData) return;

        const updatedNodes = graphData.nodes.map((node, index) => ({
            ...node,
            position: {
                x: 100 + (index % 4) * 180,
                y: 100 + Math.floor(index / 4) * 150
            }
        }));

        setGraphData({
            ...graphData,
            nodes: updatedNodes
        });
    };

    const toggleFilter = (filterKey: keyof typeof filters) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };

    const wrappedHandleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        handleMouseDown(event, canvasRef);
    };

    const wrappedHandleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        handleMouseMove(event, canvasRef, setGraphData);
    };

    const wrappedHandleMouseUp = () => {
        handleMouseUp(canvasRef);
    };

    const wrappedHandleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        handleCanvasClick(event, canvasRef);
    };

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5" />
                        Supply Chain Network
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading network visualization...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5" />
                        Interactive Supply Chain Network
                    </CardTitle>
                    <SupplyChainControls
                        isAnimating={isAnimating}
                        onToggleAnimation={() => setIsAnimating(!isAnimating)}
                        onZoom={handleZoom}
                        onResetView={resetView}
                        onResetNodePositions={resetNodePositions}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <SupplyChainFilters
                    filters={filters}
                    onToggleFilter={toggleFilter}
                />

                <div className="relative">
                    <SupplyChainCanvas
                        graphData={graphData}
                        zoomLevel={zoomLevel}
                        filters={filters}
                        selectedNode={selectedNode}
                        externalSelectedNode={externalSelectedNode}
                        draggedNode={draggedNode}
                        hoveredNode={hoveredNode}
                        isAnimating={isAnimating}
                        isDragging={isDragging}
                        onMouseDown={wrappedHandleMouseDown}
                        onMouseMove={wrappedHandleMouseMove}
                        onMouseUp={wrappedHandleMouseUp}
                        onClick={wrappedHandleCanvasClick}
                    />
                    <SupplyChainOverlays
                        zoomLevel={zoomLevel}
                        isDragging={isDragging}
                    />
                </div>

                <SupplyChainNodeDetails selectedNode={selectedNode} />
            </CardContent>
        </Card>
    );
};

export default InteractiveSupplyChainGraph;