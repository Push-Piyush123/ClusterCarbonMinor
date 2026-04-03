import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string; // e.g., "green", "blue", "teal"
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, trendUp, color = "green", description }) => {
    // Map color names to Tailwind classes dynamically or use safe defaults
    // Using specific color maps to ensure valid tailwind classes
    const colorClasses = {
        green: { bg: "bg-green-50", text: "text-green-600" },
        blue: { bg: "bg-blue-50", text: "text-blue-600" },
        teal: { bg: "bg-teal-50", text: "text-teal-600" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
        purple: { bg: "bg-purple-50", text: "text-purple-600" },
    };

    const theme = colorClasses[color as keyof typeof colorClasses] || colorClasses.green;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${theme.bg}`}>
                    <Icon className={`h-6 w-6 ${theme.text}`} />
                </div>
            </div>

            {description && (
                <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}

            {trend && (
                <div className={`flex items-center text-xs mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-medium">{trend}</span>
                    <span className="ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
