import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Section 1: Company Information
    companyName: '',
    industryType: '',
    companySize: '',
    cin: '',
    country: 'India',
    state: '',

    // Section 2: Sustainability Profile
    annualEmissions: '',
    netZeroYear: '2050',
    sustainabilityGoals: '',
    expectedCreditPurchase: '',

    // Section 3: Contact Information
    primaryContactName: '',
    email: '',
    phone: '',
    city: '',

    // Section 4: Financial & Legal
    gstNumber: '',
    panNumber: '',
    officeAddress: '',
    preferredContact: 'Email',

    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await authService.registerCompany(formData);
        if (res.success) {
            setUser(authService.getStoredUser());
            alert('Company Registration successful!');
            navigate('/company-dashboard');
        } else {
            alert('Registration failed: ' + res.message);
        }
    } catch (err: any) {
        alert('Error during registration: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-10">
            <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Company Registration</h2>
            <p className="text-gray-600 mt-2">Join our platform to invest in verified industrial emission reductions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Company Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">1. Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter company legal name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number / CIN *</label>
                  <input type="text" name="cin" required value={formData.cin} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter CIN (e.g., L17110MH1990PLC000023)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry Type *</label>
                  <select name="industryType" required value={formData.industryType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">Select Industry</option>
                    <option value="IT & Technology">IT & Technology</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Energy">Energy</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Metals">Metals</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size *</label>
                  <select name="companySize" required value={formData.companySize} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">Select Size</option>
                    <option value="Large">Large Enterprise (5000+ employees)</option>
                    <option value="Mid-size">Mid-size (500-5000 employees)</option>
                    <option value="Small">Small (50-500 employees)</option>
                    <option value="Startup">Startup (&lt;50 employees)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <select name="country" required value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50">
                    <option value="India">India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State / Union Territory *</label>
                  <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">Select State</option>
                    <optgroup label="States">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Sustainability Profile */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">2. Sustainability Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual CO₂ Emissions (tCO₂e)</label>
                  <input type="number" name="annualEmissions" value={formData.annualEmissions} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., 50000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sustainability Focus / CSR Details</label>
                  <textarea name="sustainabilityGoals" rows={3} value={formData.sustainabilityGoals} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Describe goals..." maxLength={500} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Net Zero Target Year</label>
                  <input type="number" name="netZeroYear" value={formData.netZeroYear} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Annual Credit Purchase</label>
                  <input type="number" name="expectedCreditPurchase" value={formData.expectedCreditPurchase} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., 1000" />
                </div>
              </div>
            </div>

            {/* Section 3: Contact Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">3. Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Name *</label>
                  <input type="text" name="primaryContactName" required value={formData.primaryContactName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="+91 (XXX) XXXX-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="company@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., Mumbai" />
                </div>
              </div>
            </div>

            {/* Section 4: Financial & Legal */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">4. Financial & Legal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number *</label>
                  <input type="text" name="gstNumber" required value={formData.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="15-digit GST" />
                </div>
                <div className="row-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office Address *</label>
                  <textarea name="officeAddress" required rows={4} value={formData.officeAddress} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Complete address with pin code" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                  <input type="text" name="panNumber" required value={formData.panNumber} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="10-digit PAN" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                  <select name="preferredContact" value={formData.preferredContact} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Both">Both</option>
                  </select>
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full bg-green-600 text-white py-4 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Register Company
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;