import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext';
export default function SideMenu() {
  const { logout } = useAuthContext();
  return (
    <aside>
      <ul>
        <li>
          <Link to="/home/create">Создать</Link>
        </li>
        <li>
          <Link to="/home/my-links">Мои ссылки</Link>
        </li>
        <li>
          <button onClick={logout}>Выйти</button>
        </li>
      </ul>
    </aside>
  );
}
