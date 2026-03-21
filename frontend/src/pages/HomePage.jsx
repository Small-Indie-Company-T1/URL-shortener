import { Outlet } from 'react-router-dom';
import SideMenu from '../components/home/SideMenu.jsx';

export default function HomePage() {
  return (
    <>
      <SideMenu />
      <Outlet />
    </>
  );
}
