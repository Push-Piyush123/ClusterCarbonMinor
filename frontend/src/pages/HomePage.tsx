import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Award, ArrowRight, Leaf, Globe, CheckCircle, Factory, Network, BarChart3, LayoutDashboard } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await dashboardService.getSystemMetrics();
        setMetrics(res);
      } catch (err) {
        console.error("Failed fetching homepage metrics", err);
      }
    };
    fetchMetrics();
  }, []);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Generate <span className="text-green-600">Carbon Credits</span> from
              <br />
              <span className="text-green-700">Industrial Emission Reductions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect companies with verified small industries to aggregate and trade verified
              carbon credits through efficient manufacturing practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/company-register"
                    className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <Building2 className="mr-2 h-5 w-5" />
                    Register as Company
                  </Link>
                  <Link
                    to="/aggregator-register"
                    className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <Network className="mr-2 h-5 w-5" />
                    Register as Aggregator
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Carbon Credits Work
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A transparent, automated process for aggregating industrial emission reductions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Factory className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">MSME Registers</h3>
              <p className="text-gray-600">Small industries submit energy/fuel data for baseline establishment</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Network className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automatic Clustering</h3>
              <p className="text-gray-600">System groups MSMEs by sector & region to form aggregation clusters</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Baseline & Reduction</h3>
              <p className="text-gray-600">ML-based dynamic baselines & verified emission reductions</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk-Adjusted Allocation</h3>
              <p className="text-gray-600">Fair credit allocation based on data quality & reduction contribution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose ClusterCarbon?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verified MSMEs & Aggregators</h3>
                    <p className="text-gray-600">All participating industries are vetted before clustering</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Smart Baseline Estimation</h3>
                    <p className="text-gray-600">Dynamic ML-based baselines adjust for production volume & seasonality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Risk-Adjusted Allocation</h3>
                    <p className="text-gray-600">Fair distribution based on verified reduction & data quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cluster Aggregation</h3>
                    <p className="text-gray-600">Combine small industries into efficient trading units to reduce costs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white">
              <Globe className="h-16 w-16 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Industrial Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{metrics ? metrics.totalCreditsIssued?.toLocaleString() : "Loading..."}</div>
                  <div className="text-green-100">Credits Issued</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{metrics?.activeMSMECount || '245'}</div>
                  <div className="text-green-100">Participating MSMEs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{metrics ? metrics.totalEmissionReduction?.toLocaleString() : "Loading..."}</div>
                  <div className="text-green-100">tCO₂e Reduced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{metrics?.activeClusterCount || '12'}</div>
                  <div className="text-green-100">Active Clusters</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="h-16 w-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Participate in Carbon Aggregation?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join MSMEs, companies, and aggregators building India's transparent carbon credit marketplace
          </p>
          {!user ? (
            <Link
              to="/company-register"
              className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <button
              onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}
              className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;