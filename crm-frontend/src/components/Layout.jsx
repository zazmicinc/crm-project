import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarSections = [
    {
        title: 'Main',
        items: [
            { path: '/', label: 'Home', icon: '🏠' },
        ]
    },
    {
        title: 'Sales',
        items: [
            { path: '/leads', label: 'Leads', icon: '🎯' },
            { path: '/contacts', label: 'Contacts', icon: '👥' },
            { path: '/accounts', label: 'Accounts', icon: '🏢' },
            { path: '/deals', label: 'Deals', icon: '💼' },
        ]
    },
    {
        title: 'Activities',
        items: [
            { path: '/tasks', label: 'Tasks', icon: '📋' },
        ]
    }
];

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Search state
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const isAdmin = user?.role?.name === 'Admin';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchApi.global(query);
                setResults(data);
                setShowResults(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleResultClick = (res) => {
        setQuery('');
        setShowResults(false);
        const paths = {
            lead: `/leads/${res.id}`,
            contact: `/contacts/${res.id}`,
            account: `/accounts/${res.id}`,
            deal: `/deals/${res.id}`,
        };
        navigate(paths[res.type]);
    };

    return (
        <div className="app-container flex min-h-screen bg-[#F9FAFB] font-primary gap-4 md:gap-6 lg:gap-8">
            {/* ── Sidebar Navigation ────────────────────────────────────────────── */}
            <aside className="sidebar hidden md:flex flex-col w-[245px] shrink-0 sticky top-0 h-screen bg-[#2D2D2D] z-40 border-r border-white/10 overflow-y-auto">
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center shrink-0 w-full mb-4 px-4 pt-4">
                    <div className="bg-[#E63946] text-white font-bold text-xl rounded-lg h-10 w-full flex items-center justify-center">
                        <Link to="/">ZAZMIC</Link>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-2 py-4">
                    {sidebarSections.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            <div className="px-4 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-item ${active ? 'active' : ''}`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                    {isAdmin && (
                        <div className="mb-6">
                            <div className="px-4 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                                Admin
                            </div>
                            <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                                <span className="mr-3">⚙️</span>
                                <span className="text-sm font-medium">Users</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Mobile Sidebar overlay... omitted for brevity, keeping simple hamburger */}

            {/* ── Main Layout Wrapper ─────────────────────────────────────────── */}
            <main className="main-content flex-1 flex flex-col min-h-screen min-w-0">

                {/* ── Top Navigation Bar ────────────────────────────────────────── */}
                <header className="h-16 shrink-0 bg-white border-b border-[#D1D5DB] flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    {/* Left side module title / mobile menu */}
                    <div className="flex items-center">
                        <button
                            className="md:hidden text-[#4A4A4A] p-2 mr-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-lg font-semibold text-[#1A1A1A] capitalize hidden sm:block">
                            {location.pathname === '/' ? 'Home Dashboard' : location.pathname.split('/')[1] || 'Module'}
                        </h2>
                    </div>

                    {/* Center / Right: Search & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Global Search */}
                        <div className="relative search-bar hidden sm:block w-[300px]" ref={searchRef}>
                            <svg className="search-icon w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                            <input
                                placeholder="Search records"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => query.length >= 2 && setShowResults(true)}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-3 w-3 border-2 border-[#E63946] border-t-transparent rounded-full"></div>
                                </div>
                            )}

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {showResults && results.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-[#D1D5DB] overflow-hidden max-h-[400px] overflow-y-auto z-[60]"
                                    >
                                        {['lead', 'contact', 'account', 'deal'].map(type => {
                                            const typeResults = results.filter(r => r.type === type);
                                            if (typeResults.length === 0) return null;
                                            return (
                                                <div key={type} className="border-b border-black/5 last:border-0">
                                                    <div className="px-4 py-2 bg-[#F3F4F6] text-xs uppercase text-[#6B7280] font-semibold">
                                                        {type}s
                                                    </div>
                                                    {typeResults.map(r => (
                                                        <button
                                                            key={`${r.type}-${r.id}`}
                                                            onClick={() => handleResultClick(r)}
                                                            className="w-full px-4 py-3 flex flex-col hover:bg-[#F9FAFB] transition-colors text-left"
                                                        >
                                                            <span className="text-sm font-medium text-[#1A1A1A] truncate">{r.title}</span>
                                                            <span className="text-xs text-[#6B7280] truncate mt-0.5">{r.subtitle}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Topbar Icons */}
                        <div className="flex items-center gap-1">
                            <button className="btn-icon" title="Quick Create">➕</button>
                            <button className="btn-icon">⚡</button>
                            <button className="btn-icon">
                                🔔
                                <span className="badge">1</span>
                            </button>
                            <button className="btn-icon">📅</button>
                            <button className="btn-icon">💬</button>
                            <button className="btn-icon">⚙️</button>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-3 pl-3 border-l border-[#D1D5DB]">
                            <div className="w-8 h-8 rounded-full bg-[#E63946] text-white flex items-center justify-center font-semibold text-sm">
                                {user?.first_name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden lg:block text-sm font-medium text-[#1A1A1A]">
                                {user?.first_name} {user?.last_name}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-[#6B7280] hover:text-[#E63946] transition-colors"
                                title="Logout"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.nav
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#2D2D2D] text-white border-t border-white/10 overflow-hidden"
                        >
                            <div className="p-4 flex flex-col gap-2">
                                <input
                                    className="w-full bg-white/10 rounded-md px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none mb-2"
                                    placeholder="Search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {sidebarSections.flatMap(s => s.items).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className="py-2 px-3 rounded hover:bg-white/10 text-sm font-medium"
                                    >
                                        {item.icon} <span className="ml-2">{item.label}</span>
                                    </Link>
                                ))}
                                {isAdmin && (
                                    <Link to="/admin/users" onClick={() => setMobileOpen(false)} className="py-2 px-3 rounded hover:bg-white/10 text-sm font-medium">⚙️ <span className="ml-2">Admin Options</span></Link>
                                )}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>

                {/* ── Main Content Area ─────────────────────────────────────────── */}
                <div className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

