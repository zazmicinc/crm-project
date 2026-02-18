import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/leads', label: 'Leads', icon: '🎯' },
    { path: '/', label: 'Contacts', icon: '👥' },
    { path: '/accounts', label: 'Accounts', icon: '🏢' },
    { path: '/deals', label: 'Pipeline', icon: '📊' },
    { path: '/settings/pipelines', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Helper to determine if a link is active (exact match for root, partial for others)
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            {/* ── Top nav bar ────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/5 h-[72px] px-6 lg:px-8 flex items-center justify-between shadow-lg backdrop-blur-xl bg-slate-900/70">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-glow text-white">
                        C
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                        CRM Suite
                    </h1>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-3">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
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

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-2xl text-slate-400 p-2 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Mobile nav dropdown */}
            {mobileOpen && (
                <nav className="md:hidden glass-card rounded-none border-x-0 px-6 py-4 flex flex-col gap-2 animate-fade-in absolute top-[72px] left-0 right-0 z-40 bg-slate-900/95 border-b border-white/10 shadow-2xl">
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
                </nav>
            )}

            {/* ── Main content ───────────────────────────────────────────── */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                {children}
            </main>
        </div>
    );
}
