import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Eye, EyeOff, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const VerifierRegister: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        verifierName: '',
        agencyName: '',
        accreditationId: '',
        expertise: '',
        email: '',
        phone: '',
        certificateFile: null as File | null,
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, certificateFile: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authService.registerVerifier(formData);
            if (res.success) {
                setUser(authService.getStoredUser());
                alert('Verifier Registration successful! Please wait for admin approval.');
                navigate('/verifier-dashboard');
            } else {
                alert('Registration failed: ' + res.message);
            }
        } catch (err: any) {
            alert('Error during registration: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900">Verifier Registration</h2>
                        <p className="text-gray-600 mt-2">Join as an accredited verification body</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Verifier / Auditor Name *</label>
                            <input
                                type="text"
                                name="verifierName"
                                required
                                value={formData.verifierName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Full Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name (if applicable)</label>
                            <input
                                type="text"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Verification Body Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation ID *</label>
                            <input
                                type="text"
                                name="accreditationId"
                                required
                                value={formData.accreditationId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="License / Accreditation Number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise *</label>
                            <select
                                name="expertise"
                                required
                                value={formData.expertise}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Expertise</option>
                                <option value="energy-efficiency">Industrial Energy Efficiency</option>
                                <option value="renewable-energy">Renewable Energy Projects</option>
                                <option value="waste-management">Waste Management</option>
                                <option value="forestry">Forestry & Land Use</option>
                                <option value="general">General Verification</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Accreditation Certificate
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm text-gray-600">
                                    <label htmlFor="certificateFile" className="cursor-pointer text-blue-600 hover:text-blue-700">
                                        Upload file
                                    </label>
                                    <input
                                        id="certificateFile"
                                        name="certificateFile"
                                        type="file"
                                        className="sr-only"
                                        accept=".pdf,.jpg"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {formData.certificateFile && (
                                    <p className="mt-2 text-sm text-blue-600">Selected: {formData.certificateFile.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center" // adjusted alignment
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
                        >
                            Register Verifier
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in here
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifierRegister;
