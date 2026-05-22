import { Outlet } from 'react-router-dom';
import SideMenu from '../components/home/SideMenu.jsx';
import '../styles/home-page.css';
export default function HomePage() {
    return (
        <div className="home-layout">
            <SideMenu />

            <div className="home-layout__content">
                <header className="home-header">
                    <div className="home-header__logo">T1ink</div>
                </header>

                <main className="home-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
