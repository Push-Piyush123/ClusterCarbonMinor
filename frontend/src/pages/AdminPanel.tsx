import React, { useState, useEffect } from 'react';
import { Shield, Building2, CheckCircle, XCircle, Eye, BarChart3, TreePine, DollarSign, Factory, Network, ShieldCheck, Activity } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import emissionService from '../services/emissionService';
import riskAllocationService from '../services/riskAllocationService';
import clusterService from '../services/clusterService';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'monitoring'>('overview');
  const [dashboardData, setDashboardData] = useState<any>({ metrics: null, emissions: null, allocations: null });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const resMetrics = await dashboardService.getSystemMetrics();
      const resEmissions = await emissionService.getEmissionsSummary().catch(() => ({ data: {} }));
      const resAllocations = await riskAllocationService.getAllocationsSummary().catch(() => ({ data: {} }));

      setDashboardData({ 
          metrics: resMetrics.data, 
          emissions: resEmissions.data, 
          allocations: resAllocations.data 
      });
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Derived tracking data
  const metrics = dashboardData.metrics;
  const stats = {
    totalCompanies: metrics?.activeClusterCount || 0,
    totalMSMEs: metrics?.activeMSMECount || 0,
    totalAggregators: metrics?.activeClusterCount || 0,
    totalVerifiers: 5,
    pendingRegistrations: metrics?.verificationQueueCount || 0, 
    totalVerifiedReductions: metrics?.totalEmissionReductionTCO2e || dashboardData.emissions?.totalVerified || 0,
    totalFunding: (metrics?.totalCreditsIssued || dashboardData.allocations?.totalAllocated || 0) * 20,
    activeProjects: metrics?.activeClusterCount || 0
  };

  const pendingRegistrations = [
    {
      id: '2',
      name: 'EcoMart Corporation',
      type: 'Company',
      email: 'admin@ecomart.com',
      submittedDate: '2024-01-19',
      documents: 'Business License, GST',
      status: 'pending'
    }
  ];

  const recentActivity = metrics?.topClusters?.map((c: any, i: number) => ({
      id: String(i),
      action: 'Cluster Active',
      entity: c.clusterName,
      time: 'Recently'
  })) || [];

  const handleApprove = (id: string, name: string) => {
    alert(`Approved registration for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    alert(`Rejected registration for ${name}`);
  };

  const handleGlobalCalculate = async () => {
    try {
        setProcessing(true);
        // We will trigger recalculate for the first available cluster as a platform proxy run
        const clusters = await clusterService.getClusters();
        if (clusters.data && clusters.data.length > 0) {
            await emissionService.calculateEmissions(clusters.data[0]._id, 'QTR', '2024-01-01', '2024-03-31', 'Q1 2024');
            await fetchAdminData();
            alert('Global verification calculation triggered successfully.');
        } else {
            alert('No active clusters available to calculate.');
        }
    } catch (e: any) {
        alert('Calculation failed: ' + e.message);
    } finally {
        setProcessing(false);
    }
  };

  const handleGlobalAllocate = async () => {
    try {
        setProcessing(true);
        const clusters = await clusterService.getClusters();
        if (clusters.data && clusters.data.length > 0) {
            await riskAllocationService.allocateCredits(clusters.data[0]._id, 'Q1 2024');
            await fetchAdminData();
            alert('Global risk allocation triggered successfully.');
        } else {
            alert('No active clusters available to allocate.');
        }
    } catch (e: any) {
        alert('Allocation failed: ' + e.message);
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen py-8 flex justify-center items-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Manage registrations and monitor platform activity</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'registrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Registrations ({pendingRegistrations.length})
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              System Monitoring
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>



              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total MSMEs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMSMEs}</p>
                  </div>
                  <Factory className="h-8 w-8 text-amber-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Aggregators</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAggregators}</p>
                  </div>
                  <Network className="h-8 w-8 text-indigo-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Verifiers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVerifiers}</p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-teal-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
                  </div>
                  <div className="h-8 w-8 text-orange-600">⏳</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total tCO₂e Reduced</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVerifiedReductions.toLocaleString()}</p>
                  </div>
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Funding</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalFunding.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.entity}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Pending Registrations</h2>
              <p className="text-gray-600">Review and approve new company and aggregator registrations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{registration.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${registration.type === 'Company'
                          ? 'bg-blue-100 text-blue-800'

                          : registration.type === 'MSME'
                            ? 'bg-amber-100 text-amber-800'
                            : registration.type === 'Aggregator'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                          {registration.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.submittedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.documents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => alert(`Viewing details for ${registration.name}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(registration.id, registration.name)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(registration.id, registration.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Server Status</span>
                    <span className="text-sm text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Response</span>
                    <span className="text-sm text-green-600 font-medium">Fast</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm text-yellow-600 font-medium">78% Used</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Active Users</span>
                    <span className="text-sm text-gray-900 font-medium">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects Created (Today)</span>
                    <span className="text-sm text-gray-900 font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Photos Uploaded (Today)</span>
                    <span className="text-sm text-gray-900 font-medium">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="text-sm text-gray-900 font-medium">1.2s</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent System Events</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Database backup completed successfully</span>
                    <span className="text-xs text-gray-500">10 minutes ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">System update deployed</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">High storage usage detected</span>
                    <span className="text-xs text-gray-500">4 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Security scan completed - no issues found</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;