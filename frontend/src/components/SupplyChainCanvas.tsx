import { useRef, useEffect } from 'react';
import { NetworkNode, NetworkEdge } from '@/types/digitalTwin';

interface SupplyChainCanvasProps {
    graphData: {
        nodes: NetworkNode[];
        edges: NetworkEdge[];
    } | null;
    zoomLevel: number;
    filters: {
        showSuppliers: boolean;
        showProducts: boolean;
        showStores: boolean;
        showDonations: boolean;
        carbonThreshold: number;
    };
    selectedNode: NetworkNode | null;
    externalSelectedNode: any;
    draggedNode: NetworkNode | null;
    hoveredNode: NetworkNode | null;
    isAnimating: boolean;
    isDragging: boolean;
    onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const SupplyChainCanvas = ({
    graphData,
    zoomLevel,
    filters,
    selectedNode,
    externalSelectedNode,
    draggedNode,
    hoveredNode,
    isAnimating,
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onClick
}: SupplyChainCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (graphData && canvasRef.current) {
            drawGraph();
        }
    }, [graphData, filters, zoomLevel, selectedNode, draggedNode, hoveredNode]);

    const drawGraph = () => {
        const canvas = canvasRef.current;
        if (!canvas || !graphData) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);

        const visibleNodes = graphData.nodes.filter(node => {
            if (!filters[`show${node.type.charAt(0).toUpperCase() + node.type.slice(1)}s` as keyof typeof filters]) {
                return false;
            }
            return Math.abs(node.carbonLevel) >= filters.carbonThreshold;
        });

        const visibleEdges = graphData.edges.filter(edge => {
            const sourceVisible = visibleNodes.some(n => n.id === edge.source);
            const targetVisible = visibleNodes.some(n => n.id === edge.target);
            return sourceVisible && targetVisible;
        });

        visibleEdges.forEach(edge => {
            const sourceNode = visibleNodes.find(n => n.id === edge.source);
            const targetNode = visibleNodes.find(n => n.id === edge.target);
            if (sourceNode && targetNode) {
                drawEdge(ctx, sourceNode, targetNode, edge);
            }
        });

        visibleNodes.forEach(node => {
            drawNode(ctx, node);
        });

        ctx.restore();
    };

    const drawNode = (ctx: CanvasRenderingContext2D, node: NetworkNode) => {
        const isInternallySelected = selectedNode?.id === node.id;
        const isExternallySelected = externalSelectedNode?.id === node.id;
        const isBeingDragged = draggedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id && !isBeingDragged;
        const isSelected = isInternallySelected || isExternallySelected;
        const baseSize = node.size * (isSelected ? 1.2 : 1) * (isBeingDragged ? 1.1 : 1) * (isHovered ? 1.05 : 1);

        let color = getNodeColor(node);
        if (isBeingDragged) {
            color = '#8B5CF6';
        } else if (isSelected) {
            color = '#3B82F6';
        }

        if (isBeingDragged) {
            ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
        } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }

        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, baseSize, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#1D4ED8' : '#374151';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.max(8, baseSize / 3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const icon = getNodeIcon(node.type);
        ctx.fillText(icon, node.position.x, node.position.y);

        if (Math.abs(node.carbonLevel) > 0) {
            const indicatorSize = 8;
            const indicatorX = node.position.x + baseSize - indicatorSize;
            const indicatorY = node.position.y - baseSize + indicatorSize;

            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, indicatorSize, 0, 2 * Math.PI);
            ctx.fillStyle = getCarbonIndicatorColor(node.carbonLevel);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (zoomLevel > 0.8) {
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.fillText(
                node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name,
                node.position.x,
                node.position.y + baseSize + 15
            );
        }
    };

    const drawEdge = (ctx: CanvasRenderingContext2D, source: NetworkNode, target: NetworkNode, edge: NetworkEdge) => {
        const lineWidth = Math.max(1, edge.weight / 50);

        ctx.beginPath();
        ctx.moveTo(source.position.x, source.position.y);
        ctx.lineTo(target.position.x, target.position.y);

        if (edge.animated && isAnimating) {
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = Date.now() / 100;
        } else {
            ctx.setLineDash([]);
        }

        ctx.strokeStyle = edge.color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (edge.type !== 'donation') {
            drawArrow(ctx, source, target, edge.color);
        }
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, source: NetworkNode, target: NetworkNode, color: string) => {
        const angle = Math.atan2(target.position.y - source.position.y, target.position.x - source.position.x);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;

        const endX = target.position.x - Math.cos(angle) * target.size;
        const endY = target.position.y - Math.sin(angle) * target.size;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - arrowAngle),
            endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + arrowAngle),
            endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const getNodeColor = (node: NetworkNode): string => {
        switch (node.type) {
            case 'supplier':
                return node.carbonLevel > 4 ? '#EF4444' : node.carbonLevel > 2 ? '#F97316' : '#10B981';
            case 'product':
                return node.carbonLevel > 4 ? '#EF4444' : node.carbonLevel > 2 ? '#F59E0B' : '#10B981';
            case 'store':
                return '#6366F1';
            case 'donation':
                return '#10B981';
            default:
                return '#6B7280';
        }
    };

    const getCarbonIndicatorColor = (carbonLevel: number): string => {
        if (carbonLevel < 0) return '#10B981';
        if (carbonLevel < 2) return '#F59E0B';
        if (carbonLevel < 4) return '#F97316';
        return '#EF4444';
    };

    const getNodeIcon = (type: string): string => {
        switch (type) {
            case 'supplier': return '🏭';
            case 'product': return '📦';
            case 'store': return '🏪';
            case 'donation': return '❤️';
            default: return '●';
        }
    };

    return (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onClick={onClick}
                className={`bg-gray-50 ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
                style={{ userSelect: 'none' }}
            />
        </div>
    );
};

export default SupplyChainCanvas;