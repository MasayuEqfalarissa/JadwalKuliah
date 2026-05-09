import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Home, Calendar, CheckSquare, Clock, Settings, LogOut, 
    Moon, Sun, Menu, X, BookOpen 
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
        { name: 'Jadwal Kuliah', path: '/schedules', icon: <Calendar size={20} /> },
        { name: 'Tugas', path: '/assignments', icon: <CheckSquare size={20} /> },
        { name: 'Jadwal Ujian', path: '/exams', icon: <Clock size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    const navLinkClass = ({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${isActive 
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-medium' 
            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
    `;

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                flex flex-col z-50 transition-transform duration-300 shadow-xl lg:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                        <BookOpen size={24} />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        StudySync
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={navLinkClass}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        {user?.profile_picture ? (
                            <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
