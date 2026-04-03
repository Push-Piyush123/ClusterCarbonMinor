import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const MSMERegister: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        // Section 1: Business Info
        msmeName: '',
        udyamId: '',
        industrySector: '',
        businessCategory: '',
        yearsInOperation: '',
        country: 'India',
        state: '',
        city: '',

        // Section 2: Cluster Info
        clusterName: '',
        clusterPinCode: '',

        // Section 3: Baseline Emissions
        primaryFuel: '',
        annualEnergyConsumption: '',
        energyUnit: 'kWh',
        annualCo2Emissions: '',
        productionCapacity: '',
        productionUnit: '',
        peakMonths: '',
        operatingHours: '',

        // Section 4: Projects
        energyProjects: [] as string[],
        projectDescription: '',
        projectStartDate: '',
        projectCompletionDate: '',
        expectedReduction: '',

        // Section 5: Monitoring
        smartMeter: '',
        meterInstallDate: '',
        dataFrequency: '',

        // Section 6: Contact
        ownerName: '',
        email: '',
        phone: '',
        gstNumber: '',
        panNumber: '',

        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentProjects = prev.energyProjects;
            if (checked) {
                return { ...prev, energyProjects: [...currentProjects, value] };
            } else {
                return { ...prev, energyProjects: currentProjects.filter(p => p !== value) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authService.registerMSME(formData);
            if (res.success) {
                setUser(authService.getStoredUser());
                alert('MSME Registration successful!');
                navigate('/msme-dashboard');
            } else {
                alert('Registration failed: ' + res.message);
            }
        } catch (err: any) {
            alert('Error during registration: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-orange-50">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-10">
                        <Factory className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900">MSME Registration</h2>
                        <p className="text-gray-600 mt-2">Register your small industry to begin earning verified carbon credits</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Business Information */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">1. Business Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">MSME Name *</label>
                                    <input type="text" name="msmeName" required value={formData.msmeName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Enter business name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Years in Operation *</label>
                                    <input type="number" name="yearsInOperation" required value={formData.yearsInOperation} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">UDYAM Registration ID *</label>
                                    <input type="text" name="udyamId" required value={formData.udyamId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., UDYAM-MH-09-0000013" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                    <select name="country" required value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="India">India</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry Sector *</label>
                                    <select name="industrySector" required value={formData.industrySector} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="">Select Sector</option>
                                        <option value="Textiles">Textiles</option>
                                        <option value="Foundry">Foundry</option>
                                        <option value="Food Processing">Food Processing</option>
                                        <option value="Metal & Steel">Metal & Steel</option>
                                        <option value="Energy/Utilities">Energy/Utilities</option>
                                        <option value="Chemicals">Chemical Processing</option>
                                        <option value="Ceramics">Ceramic/Glass</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State / UT *</label>
                                    <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="">Select State</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
                                    <select name="businessCategory" required value={formData.businessCategory} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="">Select Category</option>
                                        <option value="Micro">Micro</option>
                                        <option value="Small">Small</option>
                                        <option value="Medium">Medium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City / Town *</label>
                                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., Tirupur" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Cluster Information */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">2. Cluster Information (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Industrial Cluster / Area</label>
                                    <input type="text" name="clusterName" value={formData.clusterName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., Textile-Cluster-Tirupur-01" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cluster Pin Code</label>
                                    <input type="text" name="clusterPinCode" value={formData.clusterPinCode} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 641603" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Baseline Emissions */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">3. Baseline Emissions Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Fuel / Energy Type *</label>
                                    <select name="primaryFuel" required value={formData.primaryFuel} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="">Select Fuel</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Coal">Coal</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Natural Gas">Natural Gas</option>
                                        <option value="Solar">Solar</option>
                                        <option value="Biomass">Biomass</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Production Unit Type *</label>
                                    <input type="text" name="productionUnit" required value={formData.productionUnit} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., Tonnes of castings" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual Energy Consumption *</label>
                                        <input type="number" name="annualEnergyConsumption" required value={formData.annualEnergyConsumption} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Amount" />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                        <select name="energyUnit" value={formData.energyUnit} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                            <option value="kWh">kWh</option>
                                            <option value="Liters">Liters</option>
                                            <option value="Tonnes">Tonnes</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Peak Operating Months *</label>
                                    <input type="text" name="peakMonths" required value={formData.peakMonths} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., Jan-Mar" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Estimated CO₂ Emissions (tCO₂e) *</label>
                                    <input type="number" name="annualCo2Emissions" required value={formData.annualCo2Emissions} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 450" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Operating Hours</label>
                                    <input type="number" name="operatingHours" value={formData.operatingHours} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 8760" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Production Capacity *</label>
                                    <input type="number" name="productionCapacity" required value={formData.productionCapacity} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 1000" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Projects */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">4. Energy Efficiency Projects</h3>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type of Energy Project *</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {['Energy Efficiency', 'Solar Rooftop', 'Solar Water Heating', 'Biomass/Waste', 'Heat Recovery', 'Power Factor Improvement', 'Energy Management System', 'Other'].map(type => (
                                        <label key={type} className="flex items-center space-x-2">
                                            <input type="checkbox" value={type} checked={formData.energyProjects.includes(type)} onChange={handleCheckboxChange} className="rounded text-orange-600 focus:ring-orange-500" />
                                            <span className="text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Equipment / Tech Details *</label>
                                    <textarea name="projectDescription" required rows={3} value={formData.projectDescription} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Describe your project technology..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date *</label>
                                    <input type="date" name="projectStartDate" required value={formData.projectStartDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion *</label>
                                    <input type="date" name="projectCompletionDate" required value={formData.projectCompletionDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Emission Reduction (tCO₂e) *</label>
                                    <input type="number" name="expectedReduction" required value={formData.expectedReduction} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="e.g., 150" />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Monitoring */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">5. Monitoring & Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Smart Meter Available? *</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="smartMeter" value="Yes" checked={formData.smartMeter === 'Yes'} onChange={handleInputChange} className="text-orange-600 focus:ring-orange-500" />
                                            <span>Yes, installed</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="smartMeter" value="Planned" checked={formData.smartMeter === 'Planned'} onChange={handleInputChange} className="text-orange-600 focus:ring-orange-500" />
                                            <span>Will install</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="smartMeter" value="No" checked={formData.smartMeter === 'No'} onChange={handleInputChange} className="text-orange-600 focus:ring-orange-500" />
                                            <span>No, manual tracking</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Submission Frequency *</label>
                                    <select name="dataFrequency" required value={formData.dataFrequency} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                        <option value="">Select Frequency</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                {formData.smartMeter === 'Yes' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Meter Installation Date</label>
                                        <input type="date" name="meterInstallDate" value={formData.meterInstallDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 6: Contact & Banking */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">6. Contact & Legal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                                    <input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="GST IN" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Email" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                                    <input type="text" name="panNumber" required value={formData.panNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="PAN" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Phone" />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Create Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-4 px-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            Register MSME
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MSMERegister;
