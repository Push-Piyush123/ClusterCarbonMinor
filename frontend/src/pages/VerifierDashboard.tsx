import React from 'react';
import { ShieldCheck, HardHat, FileCheck } from 'lucide-react';
import StatCard from '../components/StatCard';

const VerifierDashboard: React.FC = () => {
    const stats = [
        { label: 'On-Site Visits', value: 'Schedule', icon: HardHat, color: 'blue', description: 'Schedule and manage physical verification of MSME facilities.' },
        { label: 'Document Review', value: 'Validate', icon: FileCheck, color: 'green', description: 'Validate uploaded evidence and certification documents.' },
        { label: 'Issue Certificates', value: 'Approve', icon: ShieldCheck, color: 'purple', description: 'Final approval step to mint carbon credits on the registry.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-20">
                    <ShieldCheck className="h-24 w-24 text-green-600 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Verifier Dashboard</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Access to third-party verification tools and project validation queues will be available in the next release.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                                description={stat.description}
                                color={stat.color}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifierDashboard;
