import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Package,
    Users,
    Network,
    Download,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { smartActionsService, StockAnalysis, NetworkConnection } from '@/services/smartActionsService';
import { toast } from 'sonner';

interface NetworkAnalysisReportProps {
    onClose?: () => void;
}

const NetworkAnalysisReport = ({ onClose }: NetworkAnalysisReportProps) => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectingParticipant, setConnectingParticipant] = useState<string | null>(null);

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await smartActionsService.generateNetworkReport();
            setReportData(data);
        } catch (err) {
            console.error('Error loading report data:', err);
            setError('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectParticipant = async (opportunity: NetworkConnection) => {
        try {
            setConnectingParticipant(opportunity.participantId);

            const result = await smartActionsService.connectWithParticipant(
                opportunity.participantId,
                opportunity.canProvide
            );

            if (result.success) {
                toast.success(result.message);
                // Refresh report data
                await loadReportData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to connect with participant');
        } finally {
            setConnectingParticipant(null);
        }
    };

    const getStatusColor = (status: StockAnalysis['status']) => {
        switch (status) {
            case 'overstock':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'understock':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'balanced':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: StockAnalysis['severity']) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'high':
                return <TrendingUp className="w-4 h-4 text-orange-600" />;
            case 'medium':
                return <TrendingUp className="w-4 h-4 text-yellow-600" />;
            case 'low':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return <CheckCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Network Analysis Report
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        <span className="ml-3 text-gray-600">Generating report...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-white border border-gray-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Network Analysis Report
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <Button onClick={loadReportData} className="mt-4">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Report Header */}
            <Card className="bg-white border border-gray-200 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Network Analysis Report
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const downloadData = await smartActionsService.generateDownloadableReport();

                                        // Create and trigger download
                                        const blob = new Blob([downloadData.data], { type: downloadData.mimeType });
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = downloadData.filename;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Error downloading report:', error);
                                    }
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            {onClose && (
                                <Button variant="outline" size="sm" onClick={onClose}>
                                    Close
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Categories</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {reportData.summary.totalCategories}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Overstock</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {reportData.summary.overstockCategories}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Understock</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {reportData.summary.understockCategories}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Efficiency</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {Math.round(reportData.summary.networkEfficiency * 100)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Analysis */}
            <Card className="bg-white border border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Category Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reportData.analyses.map((analysis: StockAnalysis) => (
                            <div
                                key={analysis.category}
                                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(analysis.severity)}
                                        <h3 className="font-medium text-gray-900">{analysis.category}</h3>
                                    </div>
                                    <Badge className={getStatusColor(analysis.status)}>
                                        {analysis.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {analysis.severity} severity
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {analysis.totalAvailable} available / {analysis.totalRequested} requested
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {analysis.locations.length} location(s)
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Network Opportunities */}
            {reportData.networkOpportunities.length > 0 && (
                <Card className="bg-white border border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Network className="w-5 h-5" />
                            Network Opportunities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reportData.networkOpportunities.map((opportunity: NetworkConnection) => (
                                <div
                                    key={opportunity.participantId}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{opportunity.companyName}</h3>
                                            <p className="text-sm text-gray-600">{opportunity.location}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    Can provide: {opportunity.canProvide.join(', ')}
                                                </span>
                                                {opportunity.needsItems.length > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        Needs: {opportunity.needsItems.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs">
                                                {Math.round(opportunity.matchScore * 100)}% match
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                ⭐ {opportunity.reputationScore.toFixed(1)}
                                            </Badge>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleConnectParticipant(opportunity)}
                                            disabled={connectingParticipant === opportunity.participantId}
                                        >
                                            {connectingParticipant === opportunity.participantId ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <>
                                                    Connect
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            <Card className="bg-white border border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {reportData.recommendations.map((recommendation: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-blue-900">{recommendation}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NetworkAnalysisReport;