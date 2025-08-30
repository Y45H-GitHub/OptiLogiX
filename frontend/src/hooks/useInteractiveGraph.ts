import { useState, useEffect, useRef } from 'react';
import { digitalTwinService } from '@/services/digitalTwinService';
import { InteractiveGraph, NetworkNode, SupplyChainNode, SupplyChainConnection } from '@/types/digitalTwin';

export const useInteractiveGraph = (
    nodes?: SupplyChainNode[],
    connections?: SupplyChainConnection[]
) => {
    const [graphData, setGraphData] = useState<InteractiveGraph | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [isAnimating, setIsAnimating] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [filters, setFilters] = useState({
        showSuppliers: true,
        showProducts: true,
        showStores: true,
        showDonations: true,
        carbonThreshold: 0
    });
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState<NetworkNode | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (nodes && connections) {
            convertExternalData();
        } else {
            loadGraphData();
        }
    }, [nodes, connections]);

    const convertExternalData = () => {
        if (!nodes || !connections) return;

        setLoading(true);

        const networkNodes = nodes.map((node, index) => ({
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

        const networkEdges = connections.map(conn => ({
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

    const handleZoom = (delta: number) => {
        setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const resetView = () => {
        setZoomLevel(1);
        setSelectedNode(null);
    };

    return {
        graphData,
        setGraphData,
        loading,
        selectedNode,
        setSelectedNode,
        isAnimating,
        setIsAnimating,
        zoomLevel,
        filters,
        isDragging,
        setIsDragging,
        draggedNode,
        setDraggedNode,
        dragOffset,
        setDragOffset,
        hoveredNode,
        setHoveredNode,
        animationRef,
        resetNodePositions,
        toggleFilter,
        handleZoom,
        resetView
    };
};