import React, { useState, useEffect } from 'react';
import { TreePine, DollarSign, TrendingUp, MapPin, Award } from 'lucide-react';
import dashboardService from '../services/dashboardService';

const CompanyDashboard: React.FC = () => {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await dashboardService.getSystemMetrics();
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed fetching company dash metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Mock data for company-specific metrics since no isolated endpoint exists natively
  const stats = {
    totalInvested: 25000,
    creditsPurchased: 12500,
    carbonCredits: 3120, // Available
    activeProjects: 3
  };

  const organizations = metrics?.topClusters?.map((c: any, i: number) => ({
      id: String(i),
      name: c.clusterName,
      type: 'Cluster',
      location: 'India',
      capacity: 'Variable',
      creditsIssued: c.creditsIssued,
      rating: 4.8,
      verified: true
  })) || [];

  if (loading) return <div className="min-h-screen py-8 flex justify-center items-center">Loading Operations...</div>;

  const projects = [
    {
      id: '1',
      organization: 'Textile Cluster Tirupur',
      location: 'Tirupur Industrial Estate',
      creditsPurchased: 4500,
      targetCredits: 5000,
      amountPaid: 12000,
      status: 'In Progress',
      lastUpdate: '2 days ago'
    },
    {
      id: '2',
      organization: 'Rajkot Foundry Association',
      location: 'Aji GIDC, Rajkot',
      creditsPurchased: 3200,
      targetCredits: 4000,
      amountPaid: 8500,
      status: 'In Progress',
      lastUpdate: '5 days ago'
    },
    {
      id: '3',
      organization: 'Belgaum Casting Cluster',
      location: 'Udyambag, Belgaum',
      creditsPurchased: 1800,
      targetCredits: 2000,
      amountPaid: 4500,
      status: 'Nearly Complete',
      lastUpdate: '1 day ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
          <p className="text-gray-600">Track your carbon credit investments and industrial emission reductions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalInvested.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{stats.creditsPurchased.toLocaleString()}</p>
              </div>
              <TreePine className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carbon Credits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.carbonCredits}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Current Investments</h2>
                <p className="text-gray-600">Monitor your carbon credit purchases</p>
              </div>
              <div className="p-6 space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.organization}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {project.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Credits Purchased</p>
                        <p className="font-semibold">{project.creditsPurchased} / {project.targetCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount Paid</p>
                        <p className="font-semibold">${project.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Update</p>
                        <p className="font-semibold">{project.lastUpdate}</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(project.creditsPurchased / project.targetCredits) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verified Organizations */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Verified Aggregators</h2>
                <p className="text-gray-600">Partner with trusted clusters</p>
              </div>
              <div className="p-6 space-y-4">
                {organizations.map((org: any) => (
                  <div
                    key={org.id}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-green-300 transition-colors"
                    onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{org.name}</h3>
                      {org.verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{org.type}</p>

                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {org.location}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Capacity: {org.capacity}</span>
                      <span className="text-green-600 font-medium">★ {org.rating}</span>
                    </div>

                    {selectedOrg === org.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">
                          Total credits issued: {org.creditsIssued}
                        </p>
                        <button className="w-full bg-green-600 text-white text-xs py-2 rounded-md hover:bg-green-700 transition-colors">
                          Invest in Cluster
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Fund New Project
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Download Report
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    View Certificates
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;