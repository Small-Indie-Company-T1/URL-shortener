import { Link, useLocation } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
import '../../styles/SideMenu.css';

export default function SideMenu() {
  const { logoutUser } = useAuthContext();
  const location = useLocation();

  return (
    <aside className="sidemenu">
      <div className="sidemenu__spacer"></div>
      <div className="sidemenu__link border-none opacity-0 pointer-events-none"></div>
      <nav className="sidemenu__nav">
        <Link
          to="/home/create"
          className={`sidemenu__link ${location.pathname === '/home/create' ? 'sidemenu__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">add_link</span>
          Создать
        </Link>
        <Link
          to="/home/my-links"
          className={`sidemenu__link ${location.pathname === '/home/my-links' ? 'sidemenu__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">link</span>
          Мои ссылки
        </Link>
      </nav>
      <button onClick={logoutUser} className="sidemenu__logout">
        <span className="material-symbols-outlined">logout</span>
        Выйти
      </button>
    </aside>
  );
}
