import React, { useState, useEffect } from 'react';
import { Network, Users, Database, CheckCircle, Search, Filter, ChevronRight, X, Calculator } from 'lucide-react';
import StatCard from '../components/StatCard';
import clusterService from '../services/clusterService';
import dashboardService from '../services/dashboardService';
import emissionService from '../services/emissionService';

// Data Types mapping backend Cluster schema structure
interface Cluster {
    id: string;
    name: string;
    sector: string;
    region: string;
    msmeCount: number;
    reductions: number;
    credits: number;
    status: 'Ready' | 'Pending' | 'Issued' | string;
    riskScore: number;
}

const AggregatorDashboard: React.FC = () => {
    const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
    const [clustersData, setClustersData] = useState<Cluster[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAggregatorData = async () => {
            try {
                // Fetch System / Aggregator dashboard metrics
                const resDash = await dashboardService.getSystemMetrics();
                setMetrics(resDash.data);

                // Fetch physical clusters list
                const resClusters = await clusterService.getClusters();
                
                // Map raw mongoose objects to UI defined Cluster format
                if (resClusters.data) {
                    const mapped = resClusters.data.map((c: any) => ({
                        id: c._id,
                        name: c.clusterName,
                        sector: c.sector || 'Various',
                        region: c.state || 'India',
                        msmeCount: c.memberCount || 0,
                        reductions: 0, 
                        credits: 0,
                        status: c.status || 'Pending',
                        riskScore: 0.8
                    }));
                    setClustersData(mapped);
                }
            } catch (error) {
                console.error("Failed fetching aggregator data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAggregatorData();
    }, []);

    const handleRecalculate = async (clusterId: string) => {
        try {
            await emissionService.calculateEmissions(clusterId, 'QTR', '2024-01-01', '2024-03-31', 'Q1 2024');
            alert('Emissions recalculated successfully.');
            // Re-fetch system metrics to get updated aggregated values
            const resDash = await dashboardService.getSystemMetrics();
            setMetrics(resDash.data);
        } catch (error: any) {
            alert('Recalculation failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const stats = [
        { label: 'Active Clusters', value: metrics?.activeClusterCount || 0, icon: Network, color: 'blue' },
        { label: 'Total MSMEs', value: metrics?.activeMSMECount || 0, icon: Users, color: 'indigo' },
        { label: 'Credits Issued', value: metrics?.totalCreditsIssued || 0, icon: Database, color: 'green' },
        { label: 'Avg Risk Factor', value: metrics?.averageRiskFactor || 0, icon: CheckCircle, color: 'teal' },
    ];

    if (loading) return <div className="min-h-screen py-8 flex items-center justify-center">Loading Data...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Aggregator Dashboard</h1>
                    <p className="text-gray-600">Monitor MSME clusters and allocate carbon credits</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} icon={stat.icon} color={stat.color} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Clusters List */}
                    <div className={`lg:col-span-2 transition-all duration-300`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Cluster Overview</h2>
                                <div className="flex space-x-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg"><Search className="h-4 w-4" /></button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg"><Filter className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                        <tr>
                                            <th className="px-6 py-4">Cluster ID</th>
                                            <th className="px-6 py-4">Sector</th>
                                            <th className="px-6 py-4">Region</th>
                                            <th className="px-6 py-4">MSMEs</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {clustersData.map((cluster) => (
                                            <tr
                                                key={cluster.id}
                                                className={`hover:bg-blue-50 transition cursor-pointer ${selectedCluster?.id === cluster.id ? 'bg-blue-50' : ''}`}
                                                onClick={() => setSelectedCluster(cluster)}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">{cluster.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{cluster.sector}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{cluster.region}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{cluster.msmeCount}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cluster.status === 'Ready' ? 'bg-green-100 text-green-700' :
                                                        cluster.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {cluster.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    <ChevronRight className="h-5 w-5" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel: Cluster Detail */}
                    <div className="lg:col-span-1">
                        {selectedCluster ? (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col sticky top-6">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedCluster.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedCluster.sector} | {selectedCluster.region}</p>
                                    </div>
                                    <button onClick={() => setSelectedCluster(null)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Total Reductions</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedCluster.reductions.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">tCO₂e</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Total Credits</p>
                                            <p className="text-lg font-bold text-green-600">{selectedCluster.credits.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Verified</p>
                                        </div>
                                    </div>

                                    {/* Allocation Logic Visualization */}
                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                        <div className="flex items-center mb-3">
                                            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                                            <h3 className="font-bold text-blue-900 text-sm">Risk-Adjusted Allocation</h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs text-blue-800">
                                                <span>Cluster Risk Score</span>
                                                <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm">{selectedCluster.riskScore}</span>
                                            </div>

                                            <div className="bg-white p-3 rounded border border-blue-200 text-center">
                                                <p className="text-xs text-gray-500 mb-2">Each MSME's Credit Formula:</p>
                                                <p className="text-xs font-mono font-bold text-blue-700">
                                                    (Raw Reduction × Risk Score)
                                                    <br />---------------------------<br />
                                                    Σ(All MSME Adjusted Reductions)
                                                </p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleRecalculate(selectedCluster.id)}
                                            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center"
                                        >
                                            Recalculate Allocation
                                        </button>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-900 mb-3 text-sm">Top Contributors</h4>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">MSME-001 (Textiles)</span>
                                                <span className="font-medium">102 Credits</span>
                                            </li>
                                            <li className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">MSME-004 (Dyeing)</span>
                                                <span className="font-medium">98 Credits</span>
                                            </li>
                                            <li className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">MSME-012 (Processing)</span>
                                                <span className="font-medium">85 Credits</span>
                                            </li>
                                        </ul>
                                        <button className="w-full text-center text-xs text-green-600 font-medium mt-3 hover:underline">
                                            View all {selectedCluster.msmeCount} MSMEs
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                    {selectedCluster.status === 'Ready' && (
                                        <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition flex justify-center items-center">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Approve & Issue Credits
                                        </button>
                                    )}
                                    {selectedCluster.status === 'Pending' && (
                                        <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
                                            Verification Pending
                                        </button>
                                    )}
                                    {selectedCluster.status === 'Issued' && (
                                        <button className="w-full bg-teal-100 text-teal-700 py-3 rounded-xl font-bold flex justify-center items-center cursor-default">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Already Issued
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                <Network className="h-16 w-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a cluster to view details</p>
                                <p className="text-sm">Click on any row in the overview table</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AggregatorDashboard;
