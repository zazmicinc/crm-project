import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchApi } from '../api';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/leads', label: 'Leads', icon: '🎯' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/accounts', label: 'Accounts', icon: '🏢' },
    { path: '/deals', label: 'Pipeline', icon: '📊' },
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

    // Helper to determine if a link is active
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
        <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            {/* ── Top nav bar ────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/5 h-[72px] px-6 lg:px-8 flex items-center justify-between shadow-lg backdrop-blur-xl bg-slate-900/70">
                <div className="flex items-center gap-6 flex-1">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-glow text-white">
                            C
                        </div>
                        <h1 className="hidden lg:block text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                            CRM Suite
                        </h1>
                    </Link>

                    {/* Global Search */}
                    <div className="relative max-w-md w-full ml-4 hidden sm:block" ref={searchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-xs">🔍</span>
                        </div>
                        <input
                            className="w-full bg-slate-800/40 border border-white/5 rounded-full py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-800/60 transition-all"
                            placeholder="Search everything..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Search Results Dropdown */}
                        {showResults && results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 glass-card border border-white/10 shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto z-[60] bg-slate-900/95 backdrop-blur-2xl">
                                {['lead', 'contact', 'account', 'deal'].map(type => {
                                    const typeResults = results.filter(r => r.type === type);
                                    if (typeResults.length === 0) return null;
                                    return (
                                        <div key={type} className="border-b border-white/5 last:border-0">
                                            <div className="px-4 py-2 bg-slate-800/30 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                                {type}s
                                            </div>
                                            {typeResults.map(r => (
                                                <button
                                                    key={`${r.type}-${r.id}`}
                                                    onClick={() => handleResultClick(r)}
                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-500/10 transition-colors text-left"
                                                >
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
                                                        <p className="text-[11px] text-slate-500 truncate">{r.subtitle}</p>
                                                    </div>
                                                    {r.status && (
                                                        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5 uppercase">
                                                            {r.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden xl:flex gap-1.5 ml-6">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                        active
                                            ? 'bg-indigo-500/10 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span className={active ? 'text-indigo-400' : 'opacity-70'}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4 ml-4">
                    {/* Compact nav for smaller desktops */}
                    <nav className="hidden md:flex xl:hidden gap-1">
                        {navItems.map(item => (
                            <Link key={item.path} to={item.path} className={`p-2 rounded-lg ${isActive(item.path) ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`} title={item.label}>
                                {item.icon}
                            </Link>
                        ))}
                    </nav>

                    {isAdmin && (
                        <div className="hidden lg:flex items-center gap-2">
                            <div className="w-px h-4 bg-slate-800 mx-1" />
                            <Link to="/admin/users" className={`p-2 rounded-lg ${isActive('/admin/users') ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'}`} title="Users">👤</Link>
                            <Link to="/settings/pipelines" className={`p-2 rounded-lg ${isActive('/settings/pipelines') ? 'text-slate-200 bg-white/5' : 'text-slate-400'}`} title="Settings">⚙️</Link>
                        </div>
                    )}

                    <div className="hidden sm:flex flex-col items-end shrink-0">
                        <span className="text-sm font-semibold text-slate-200">{user?.first_name} {user?.last_name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{user?.role?.name}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-2xl text-slate-400 p-2 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </header>

            {/* Mobile nav dropdown */}
            {mobileOpen && (
                <nav className="md:hidden glass-card rounded-none border-x-0 px-6 py-4 flex flex-col gap-2 animate-fade-in absolute top-[72px] left-0 right-0 z-40 bg-slate-900/95 border-b border-white/10 shadow-2xl">
                    {/* Mobile Search */}
                    <div className="mb-4">
                        <input
                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 ${
                                    active
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                    {isAdmin && (
                        <>
                            <div className="h-px bg-slate-800 my-1 mx-4" />
                            <Link
                                to="/admin/users"
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 ${
                                    isActive('/admin/users') ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:bg-white/5'
                                }`}
                            >
                                <span>👤</span> User Management
                            </Link>
                        </>
                    )}
                </nav>
            )}

            {/* ── Main content ───────────────────────────────────────────── */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                {children}
            </main>
        </div>
    );
}
