import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Factory, Users, Award, Shield, ArrowRight } from 'lucide-react';

const RegisterLanding: React.FC = () => {
    const roles = [
        {
            id: 'msme',
            title: 'MSME / Industry',
            description: 'Register your industrial unit to sell carbon credits.',
            icon: Factory,
            path: '/msme-register',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'hover:border-blue-200'
        },
        {
            id: 'aggregator',
            title: 'Aggregator / Cluster',
            description: 'Manage clusters of MSMEs and facilitate trading.',
            icon: Users,
            path: '/aggregator-register',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'hover:border-green-200'
        },
        {
            id: 'company',
            title: 'Corporate Buyer',
            description: 'Purchase verified credits to offset emissions.',
            icon: Building2,
            path: '/company-register',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'hover:border-indigo-200'
        },
        {
            id: 'verifier',
            title: 'Verifier / Auditor',
            description: 'Join as an accredited verification body.',
            icon: Award,
            path: '/verifier-register',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'hover:border-orange-200'
        },
        {
            id: 'admin',
            title: 'Platform Admin',
            description: 'Internal platform management (Restricted).',
            icon: Shield,
            path: '/admin-register',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'hover:border-purple-200'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Join ClusterCarbon</h1>
                    <p className="text-xl text-gray-600">Select your role to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <Link
                            key={role.id}
                            to={role.path}
                            className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${role.borderColor} group`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${role.bgColor}`}>
                                    <role.icon className={`h-8 w-8 ${role.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                                        {role.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{role.description}</p>
                                    <div className={`flex items-center text-sm font-medium ${role.color}`}>
                                        Get Started <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterLanding;
