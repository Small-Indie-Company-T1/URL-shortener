import { Link } from 'react-router-dom';
export default function SideMenu() {
  return (
    <aside>
      <ul>
        <li>
          <Link to="/home/create">Создать</Link>
        </li>
        <li>
          <Link to="/home/my-links">Мои ссылки</Link>
        </li>
      </ul>
    </aside>
  );
}
