import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterLanding from './pages/RegisterLanding';
import CompanyRegister from './pages/CompanyRegister';
import MSMERegister from './pages/MSMERegister';
import AggregatorRegister from './pages/AggregatorRegister';
import VerifierRegister from './pages/VerifierRegister';
import AdminRegister from './pages/AdminRegister';
import Login from './pages/Login';
import CompanyDashboard from './pages/CompanyDashboard';

import AdminPanel from './pages/AdminPanel';
import MSMEDashboard from './pages/MSMEDashboard';
import AggregatorDashboard from './pages/AggregatorDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterLanding />} />
            <Route path="/company-register" element={<CompanyRegister />} />
            <Route path="/msme-register" element={<MSMERegister />} />
            <Route path="/aggregator-register" element={<AggregatorRegister />} />
            <Route path="/verifier-register" element={<VerifierRegister />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/login" element={<Login />} />
            <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['Company', 'COMPANY', 'company']}><CompanyDashboard /></ProtectedRoute>} />

            <Route path="/msme/dashboard" element={<ProtectedRoute allowedRoles={['MSME', 'msme']}><MSMEDashboard /></ProtectedRoute>} />
            <Route path="/aggregator/dashboard" element={<ProtectedRoute allowedRoles={['Aggregator', 'AGGREGATOR', 'aggregator']}><AggregatorDashboard /></ProtectedRoute>} />
            <Route path="/verifier/dashboard" element={<ProtectedRoute allowedRoles={['Verifier', 'VERIFIER', 'verifier']}><VerifierDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'admin']}><AdminPanel /></ProtectedRoute>} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;