import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  
  // Hide header on survey taking page
  if (location.pathname === '/survey') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">VHDN Survey</span>
        </Link>
        
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/survey" 
            className={`nav-link nav-link-primary ${location.pathname === '/survey' ? 'active' : ''}`}
          >
            Làm khảo sát
          </Link>
          <Link 
            to="/results" 
            className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}
          >
            Xem kết quả
          </Link>
        </nav>
      </div>
    </header>
  );
}
