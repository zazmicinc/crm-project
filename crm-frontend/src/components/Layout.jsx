import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/leads', label: 'Leads' },
    { path: '/contacts', label: 'Contacts' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/deals', label: 'Pipeline' },
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
        <div className="min-h-screen bg-apple-bg text-apple-text font-sans">
            {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-white/80 backdrop-blur-[20px] border-b border-black/10 flex items-center justify-between px-6 transition-all">

                {/* Left: Logo */}
                <div className="flex items-center shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        {/* Example logo text if no image exists */}
                        <span className="font-semibold text-[17px] text-apple-text">Zazmic CRM</span>
                    </Link>
                </div>

                {/* Center: Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-[14px] transition-colors ${active
                                    ? 'text-apple-blue font-medium'
                                    : 'text-apple-text hover:text-apple-blue font-medium opacity-80'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Search & User Actions */}
                <div className="flex items-center justify-end gap-6">

                    {/* Global Search */}
                    <div className="hidden sm:block relative w-64" ref={searchRef}>
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 2 && setShowResults(true)}
                            className="bg-apple-bg rounded-full pl-10 pr-4 py-1.5 text-[14px] w-full border border-transparent focus:bg-white focus:border-apple-blue focus:outline-none transition-all placeholder:text-apple-gray"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-3 w-3 border-2 border-apple-blue border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showResults && results.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full mt-2 left-0 right-0 bg-white/90 backdrop-blur-[20px] rounded-2xl shadow-apple-lg border border-black/5 overflow-hidden max-h-[400px] overflow-y-auto z-[60]"
                                >
                                    {['lead', 'contact', 'account', 'deal'].map(type => {
                                        const typeResults = results.filter(r => r.type === type);
                                        if (typeResults.length === 0) return null;
                                        return (
                                            <div key={type} className="border-b border-black/5 last:border-0">
                                                <div className="px-4 py-2 bg-apple-bg/50 text-[10px] uppercase tracking-wider text-apple-gray font-semibold">
                                                    {type}s
                                                </div>
                                                {typeResults.map(r => (
                                                    <button
                                                        key={`${r.type}-${r.id}`}
                                                        onClick={() => handleResultClick(r)}
                                                        className="w-full px-4 py-3 flex flex-col hover:bg-black/5 transition-colors text-left"
                                                    >
                                                        <span className="text-[14px] font-medium text-apple-text truncate">{r.title}</span>
                                                        <span className="text-[12px] text-apple-gray truncate mt-0.5">{r.subtitle}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <span className="text-[14px] font-medium text-apple-text">{user?.first_name}</span>
                        {isAdmin && (
                            <>
                                <Link to="/admin/users" className="text-apple-gray hover:text-apple-blue transition-colors text-sm font-medium" title="Users">Admin</Link>
                                <Link to="/settings/pipelines" className="text-apple-gray hover:text-apple-blue transition-colors text-sm font-medium" title="Settings">Settings</Link>
                            </>
                        )}
                        <button
                            onClick={handleLogout}
                            className="text-[14px] font-medium text-apple-gray hover:text-danger transition-colors"
                            title="Logout"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-apple-text p-1"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden fixed top-12 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/10 overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-4">
                            {/* Mobile Search */}
                            <div>
                                <input
                                    className="w-full bg-apple-bg rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-apple-blue border border-transparent"
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
                                        className={`text-[17px] font-medium ${active ? 'text-apple-blue' : 'text-apple-text'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-black/10 my-2" />
                            {isAdmin && (
                                <Link to="/admin/users" onClick={() => setMobileOpen(false)} className="text-[17px] text-apple-gray font-medium">User Admin</Link>
                            )}
                            <button onClick={handleLogout} className="text-left text-[17px] text-danger font-medium mt-2">Log Out</button>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>

            {/* ── Main Content ────────────────────────────────────────────── */}
            <main className="pt-[80px] pb-24 px-6 lg:px-8 max-w-[1200px] mx-auto min-h-screen">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
