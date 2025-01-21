// Header.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import Logo from '../../assets/Logo.png'; // Ensure the correct path to your logo

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={Logo} alt="ConnecTour Logo" className="logo-image" />
          ConnecTour
        </Link>
        <nav className="nav-right">
          {currentUser ? (
            <>
              <span className="user-name">Welcome, {currentUser.fullName}</span>
              {location.pathname !== '/profile' && (
                <button className="btn primary" onClick={() => navigate('/profile')}>My Profile</button>
              )}
              {location.pathname === '/profile' && (
                <button className="btn primary" onClick={() => navigate('/bookings')}>My Bookings</button>
              )}
              <button className="btn primary" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              {location.pathname !== '/signin' && (
                <button className="btn primary" onClick={() => navigate('/signin')}>Sign in</button>
              )}
              {location.pathname !== '/signup' && (
                <button className="btn primary" onClick={() => navigate('/signup')}>Sign up</button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;