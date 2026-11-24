import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="topbar">
      <Link className="brand" to={isAuth ? '/movies' : '/'}>
        MOVIE <span>MANIA</span>
      </Link>

      {isAuth ? (
        <div className="account">
          <span>
            {user?.name || user?.email}
            {user?.role === 'admin' && (
              <span style={{ color: '#e50914', marginLeft: 6, fontSize: 11, fontWeight: 700 }}>
                ADMIN
              </span>
            )}
          </span>
          <Link className="button" to="/likes" style={{ borderColor: '#e50914', color: '#e50914' }}>
            ❤️ My Likes
          </Link>
          <button className="button" onClick={handleLogout}>Log out</button>
        </div>
      ) : (
        <Link className="button red" to="/login">Sign in</Link>
      )}
    </header>
  );
}
