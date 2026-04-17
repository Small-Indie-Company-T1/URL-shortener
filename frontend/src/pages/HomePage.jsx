import { Outlet } from 'react-router-dom';
import SideMenu from '../components/home/SideMenu.jsx';

export default function HomePage() {
    return (
        <div className="flex min-h-screen w-full bg-[#EEF8FF]">
            <SideMenu />

            <div className="flex-1 flex flex-col">
                <header className="h-[60px] bg-[#D7E7F2] flex items-center pr-24 shrink-0 border-b border-[#CAC4D0]">
                    <div className="w-14 shrink-0"></div>
                    <div className="text-2xl font-black text-[#0B1120] tracking-tight ml-20">T1ink</div>
                </header>

                <main className="flex-1 flex justify-center items-start pt-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}