import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

export default function Layout() {

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNavigation />
                <main className="flex-1 overflow-auto p-4 md:p-6 relative">
                    <div className="h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
