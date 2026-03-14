import React from "react";
import { Search, Sun, Moon, Bell, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function TopNavigation() {
    const { theme, toggleTheme, user } = useAppContext();

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white/70 dark:bg-white/5 backdrop-blur-md border-b border-gray-200 dark:border-white/10 z-10 transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search city, sensor, or node ID..."
                        className="w-full bg-gray-100 dark:bg-slate-900/50 border border-transparent dark:border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-green transition-all dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                </button>

                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5 dark:text-gray-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-gray-200 dark:border-white/10">
                    <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green border border-neon-green/50">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block dark:text-gray-200">{user}</span>
                </div>
            </div>
        </header>
    );
}
