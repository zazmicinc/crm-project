import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Contacts', icon: '👥' },
    { path: '/accounts', label: 'Accounts', icon: '🏢' },
    { path: '/deals', label: 'Pipeline', icon: '📊' },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Top nav bar ────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        C
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        CRM Suite
                    </h1>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === item.path
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-2xl text-slate-400"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Mobile nav dropdown */}
            {mobileOpen && (
                <nav className="md:hidden glass-card rounded-none border-x-0 px-6 py-3 flex flex-col gap-2 animate-fade-in">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${location.pathname === item.path
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'text-slate-400'
                                }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            )}

            {/* ── Main content ───────────────────────────────────────────── */}
            <main className="flex-1 px-4 md:px-8 py-6 max-w-[1400px] mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
