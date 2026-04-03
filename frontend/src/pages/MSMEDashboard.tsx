import React, { useState, useEffect } from 'react';
import { Factory, Zap, TrendingUp, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';

const MSMEDashboard: React.FC = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) return;
            try {
                const res = await dashboardService.getMSMEDashboard(user.id);
                setDashboardData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    // Map Backend Data to UI structures
    const stats = {
        creditsEarned: dashboardData?.summary?.totalCredits || 0,
        activeDevices: dashboardData?.msme?.devices?.length || 3, // Fallback if no devices yet
        carbonReduced: dashboardData?.summary?.totalEmissions || dashboardData?.summary?.totalCarbonReduced || 0,
        pendingVerification: dashboardData?.summary?.pendingCredits || 0
    };

    const devices = dashboardData?.msme?.devices?.length ? dashboardData.msme.devices : [
        { id: 1, name: 'Boiler Monitor #1', status: 'Active', lastReading: '45 mins ago', efficiency: '98%' },
        { id: 2, name: 'Solar Inverter', status: 'Active', lastReading: '10 mins ago', efficiency: '100%' }
    ];

    const recentActivity = dashboardData?.allocations?.map((alloc: any) => ({
        id: alloc._id,
        type: 'Credit Allocation',
        amount: '+' + alloc.allocatedCredits + ' Credits',
        date: new Date(alloc.createdAt).toLocaleDateString(),
        status: alloc.status
    })) || [];

    if (loading) {
        return <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">Loading Data...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">MSME Dashboard</h1>
                        <p className="text-gray-600">Monitor your industrial emissions and credit generation</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        + Register New Device
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.creditsEarned}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Devices</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeDevices}</p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Carbon Reduced</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.carbonReduced} tCO₂e</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerification}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Device Status */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Status</h2>
                        <div className="space-y-4">
                            {devices.map((device: any) => (
                                <div key={device.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <Factory className={`h-10 w-10 p-2 rounded-full ${device.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`} />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{device.name}</h3>
                                            <p className="text-sm text-gray-500">Last reading: {device.lastReading}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${device.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {device.status}
                                        </span>
                                        <p className="text-sm font-medium text-gray-600 mt-1">Eff: {device.efficiency}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.type}</p>
                                        <p className="text-xs text-gray-500">{activity.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${activity.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>{activity.amount}</p>
                                        <p className="text-xs text-gray-500">{activity.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                            View All Activity
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MSMEDashboard;
