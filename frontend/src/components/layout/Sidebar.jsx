import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const getLinks = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { path: '/dashboard', label: 'System Dashboard' },
          { path: '/verification-queue', label: 'Verification Queue' }
        ];
      case 'Aggregator':
        return [
          { path: '/dashboard', label: 'Cluster Dashboard' }
        ];
      case 'MSME':
        return [
          { path: '/msme/dashboard', label: 'My Progress' }
        ];
      case 'Verifier':
        return [
          { path: '/verification-queue', label: 'Verification Queue' }
        ];
      default:
        return [
          { path: '/dashboard', label: 'Dashboard' }
        ];
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">ClusterCarbon</div>
      <div className="sidebar-nav">
        {getLinks().map(link => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
