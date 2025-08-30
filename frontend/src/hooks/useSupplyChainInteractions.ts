import { useState, useCallback } from 'react';
import { NetworkNode, SupplyChainNode, InteractiveGraph } from '@/types/digitalTwin';

interface UseSupplyChainInteractionsProps {
    graphData: InteractiveGraph | null;
    zoomLevel: number;
    onNodeSelect?: (node: SupplyChainNode) => void;
    onNodeClick?: (node: NetworkNode) => void;
}

export const useSupplyChainInteractions = ({
    graphData,
    zoomLevel,
    onNodeSelect,
    onNodeClick
}: UseSupplyChainInteractionsProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState<NetworkNode | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

    const getMousePosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / zoomLevel,
            y: (event.clientY - rect.top) / zoomLevel
        };
    }, [zoomLevel]);

    const findNodeAtPosition = useCallback((x: number, y: number): NetworkNode | null => {
        if (!graphData) return null;

        return graphData.nodes.find(node => {
            const distance = Math.sqrt(
                Math.pow(x - node.position.x, 2) + Math.pow(y - node.position.y, 2)
            );
            return distance <= node.size;
        }) || null;
    }, [graphData]);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
        if (!graphData) return;

        const { x, y } = getMousePosition(event, canvasRef);
        const clickedNode = findNodeAtPosition(x, y);

        if (clickedNode) {
            setIsDragging(true);
            setDraggedNode(clickedNode);
            setDragOffset({
                x: x - clickedNode.position.x,
                y: y - clickedNode.position.y
            });
        }
    }, [graphData, getMousePosition, findNodeAtPosition]);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>, setGraphData: (data: InteractiveGraph) => void) => {
        const { x, y } = getMousePosition(event, canvasRef);

        if (isDragging && draggedNode && graphData) {
            const updatedNodes = graphData.nodes.map(node => {
                if (node.id === draggedNode.id) {
                    return {
                        ...node,
                        position: {
                            x: x - dragOffset.x,
                            y: y - dragOffset.y
                        }
                    };
                }
                return node;
            });

            const updatedGraphData = {
                ...graphData,
                nodes: updatedNodes
            };

            setGraphData(updatedGraphData);

            const updatedDraggedNode = updatedNodes.find(n => n.id === draggedNode.id);
            if (updatedDraggedNode) {
                setDraggedNode(updatedDraggedNode);
            }
        } else {
            const hoveredNode = findNodeAtPosition(x, y);
            setHoveredNode(hoveredNode);
        }
    }, [isDragging, draggedNode, graphData, dragOffset, getMousePosition, findNodeAtPosition]);

    const handleMouseUp = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>) => {
        if (isDragging && draggedNode) {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.style.transition = 'transform 0.1s ease-out';
                setTimeout(() => {
                    if (canvas) canvas.style.transition = '';
                }, 100);
            }
        }

        setIsDragging(false);
        setDraggedNode(null);
        setDragOffset({ x: 0, y: 0 });
        setHoveredNode(null);
    }, [isDragging, draggedNode]);

    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
        if (isDragging) return;
        if (!graphData) return;

        const { x, y } = getMousePosition(event, canvasRef);
        const clickedNode = findNodeAtPosition(x, y);

        if (clickedNode) {
            setSelectedNode(clickedNode);
            onNodeClick?.(clickedNode);

            if (onNodeSelect && clickedNode.metadata) {
                onNodeSelect(clickedNode.metadata as SupplyChainNode);
            }
        } else {
            setSelectedNode(null);
            // Clear external selection when clicking on empty space
            if (onNodeSelect) {
                onNodeSelect(null as any);
            }
        }
    }, [isDragging, graphData, getMousePosition, findNodeAtPosition, onNodeClick, onNodeSelect]);

    return {
        isDragging,
        draggedNode,
        hoveredNode,
        selectedNode,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleCanvasClick
    };
};