import { Link, useLocation } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
import '../../styles/side-menu.css';

export default function SideMenu() {
  const { logoutUser } = useAuthContext();
  const location = useLocation();

  return (
    <aside className="side-menu">
      <div className="side-menu__spacer"></div>
      <div className="side-menu__link border-none opacity-0 pointer-events-none"></div>
      <nav className="side-menu__nav">
        <Link
          to="/home/create"
          className={`side-menu__link ${location.pathname === '/home/create' ? 'side-menu__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">add_link</span>
          Создать
        </Link>
        <Link
          to="/home/my-links"
          className={`side-menu__link ${location.pathname === '/home/my-links' ? 'side-menu__link--active' : ''}`}
        >
          <span className="material-symbols-outlined">link</span>
          Мои ссылки
        </Link>
        <button onClick={logoutUser} className="side-menu__link">
          <span className="material-symbols-outlined">logout</span>
          Выйти
        </button>
      </nav>
    </aside>
  );
}
