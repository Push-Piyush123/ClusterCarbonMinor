import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Upload, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const AggregatorRegister: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Exact requested fields
    const [formData, setFormData] = useState({
        clusterName: '',
        entityType: '',
        email: '',
        phoneNumber: '',
        state: '',
        district: '',
        // emissionReductionPotential removed
        verificationDocuments: null as File | null,
        password: '',
        termsAgreed: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Cluster Name
        if (!formData.clusterName.trim()) newErrors.clusterName = "Cluster name is required";

        // Entity Type
        if (!formData.entityType) newErrors.entityType = "Entity type is required";

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Phone (+91 format)
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Must start with +91 followed by 10 digits";
        }

        // State & District
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.district.trim()) newErrors.district = "District is required";

        // Emission Potential validation removed

        // Documents
        if (!formData.verificationDocuments) {
            newErrors.verificationDocuments = "Verification document is required";
        }

        // Password
        // Minimum 8 characters, at least 1 uppercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Must be 8+ chars, with 1 uppercase, 1 number, 1 special char";
        }

        // Terms
        if (!formData.termsAgreed) newErrors.termsAgreed = "You must agree to the terms";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, verificationDocuments: "Invalid file type. Upload PDF, DOC, or JPG." }));
                return;
            }

            if (file.size > maxSize) {
                setErrors(prev => ({ ...prev, verificationDocuments: "File size exceeds 10MB limit." }));
                return;
            }

            setFormData(prev => ({ ...prev, verificationDocuments: file }));
            setErrors(prev => ({ ...prev, verificationDocuments: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to top or first error if needed
            window.scrollTo(0, 0);
            return;
        }

        setIsLoading(true);

        try {
            // Construct strictly defined payload
            const payload = {
                clusterName: formData.clusterName,
                entityType: formData.entityType,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                state: formData.state,
                district: formData.district,
                // emissionReductionPotential removed from payload
                verificationDocuments: formData.verificationDocuments, // Note: In real API this would be FormData
                password: formData.password,
                termsAgreed: formData.termsAgreed
            };

            console.log('Registering Aggregator with payload:', payload);

            // Send formal API request to Auth Endpoint
            const res = await authService.registerAggregator(payload);
            if (res.success) {
                setUser(authService.getStoredUser());
                alert('Aggregator Registration successful!');
                navigate('/aggregator-dashboard');
            } else {
                alert('Registration failed: ' + res.message);
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            alert('Error during registration: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <Network className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900">
                            Aggregator Registration
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Join as a cluster aggregator to connect MSMEs with carbon credit buyers
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Cluster Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cluster / Aggregator Name *
                            </label>
                            <input
                                type="text"
                                name="clusterName"
                                value={formData.clusterName}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.clusterName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter Cluster Name"
                            />
                            {errors.clusterName && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.clusterName}</p>}
                        </div>

                        {/* Entity Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Entity Type *
                            </label>
                            <select
                                name="entityType"
                                value={formData.entityType}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.entityType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select type</option>
                                <option value="cluster-aggregator">Industrial Cluster Aggregator</option>
                                <option value="industry-association">Industry Association</option>
                                <option value="msme-cooperative">MSME Cooperative</option>
                                <option value="tech-provider">Technology Provider</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.entityType && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.entityType}</p>}
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="contact@org.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="+919876543210"
                                />
                                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.phoneNumber}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select state</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.state && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.state}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District *
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter district"
                                />
                                {errors.district && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.district}</p>}
                            </div>
                        </div>

                        {/* Emission Potential Removed */}

                        {/* Documents */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Documents *
                            </label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${errors.verificationDocuments ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-green-400'}`}>
                                <Upload className={`h-8 w-8 mx-auto mb-2 ${errors.verificationDocuments ? 'text-red-400' : 'text-gray-400'}`} />
                                <div className="text-sm text-gray-600">
                                    <label htmlFor="verificationDocuments" className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                                        Upload documents
                                    </label>
                                    <input
                                        id="verificationDocuments"
                                        name="verificationDocuments"
                                        type="file"
                                        className="sr-only"
                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                        onChange={handleFileChange}
                                    />
                                    <span className="pl-1">or drag and drop</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Registration certificate, tax ID (PDF, DOC, JPG up to 10MB)</p>
                                {formData.verificationDocuments && (
                                    <p className="mt-2 text-sm text-green-600 font-medium">Selected: {formData.verificationDocuments.name}</p>
                                )}
                                {errors.verificationDocuments && <p className="mt-2 text-xs text-red-600">{errors.verificationDocuments}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.password}</p>}
                            <p className="mt-1 text-xs text-gray-500">Min 8 chars, 1 uppercase, 1 number, 1 special char</p>
                        </div>

                        {/* Terms */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    id="termsAgreed"
                                    name="termsAgreed"
                                    type="checkbox"
                                    checked={formData.termsAgreed}
                                    onChange={handleInputChange}
                                    className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${errors.termsAgreed ? 'border-red-500' : ''}`}
                                />
                                <label htmlFor="termsAgreed" className="ml-2 block text-sm text-gray-900">
                                    I agree to the{' '}
                                    <a href="#" className="text-green-600 hover:text-green-700">
                                        Terms and Conditions
                                    </a>{' '}
                                    and confirm that all provided information is accurate
                                </label>
                            </div>
                            {errors.termsAgreed && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.termsAgreed}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Registering...' : 'Register as Aggregator'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                            Sign in here
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AggregatorRegister;
