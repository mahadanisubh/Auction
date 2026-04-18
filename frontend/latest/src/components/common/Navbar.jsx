import { useAuction } from '../../hooks/useAuction.js';
import { disconnectSocket } from '../../sockets/socket.js';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

export default function Navbar({children}) {
  const { role, logout, userName } = useAuction();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1> Cricket Auction</h1>
        </div>
        
        <div className="navbar-menu">
          <span className="role-badge">{role ? role.toUpperCase() : "USER"}</span>
          <span className="role-badge">{userName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className='navbar-sidebar'>
          {children}
        </div>
    </nav>
  );
}
