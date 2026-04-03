import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="navbar">
      <div className="user-info">
        <span style={{ marginRight: '1rem', fontWeight: 500 }}>
          {user?.name || user?.email || 'User'}
        </span>
        <button onClick={logout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
