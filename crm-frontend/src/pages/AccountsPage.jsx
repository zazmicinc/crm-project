import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { accountsApi } from '../api';
import AccountForm from '../components/AccountForm';
import { useAuth } from '../context/AuthContext';

export default function AccountsPage() {
    const { hasPermission } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const data = await accountsApi.list(params);
            setAccounts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchAccounts, 300);
        return () => clearTimeout(timer);
    }, [fetchAccounts]);

    const handleCreate = async (data) => {
        await accountsApi.create(data);
        setShowForm(false);
        fetchContacts(); // wait, should be fetchAccounts
    };

    // Correcting the function name for account fetching
    const handleCreateFixed = async (data) => {
        await accountsApi.create(data);
        setShowForm(false);
        fetchAccounts();
    };

    const handleUpdate = async (data) => {
        await accountsApi.update(editingAccount.id, data);
        setEditingAccount(null);
        fetchAccounts();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this account and all associated contacts/deals?')) return;
        await accountsApi.delete(id);
        fetchAccounts();
    };

    if (showForm) {
        return <AccountForm onSubmit={handleCreateFixed} onCancel={() => setShowForm(false)} />;
    }

    if (editingAccount) {
        return (
            <AccountForm
                key={editingAccount.id}
                account={editingAccount}
                onSubmit={handleUpdate}
                onCancel={() => setEditingAccount(null)}
            />
        );
    }

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Accounts</h1>
                    <p className="text-slate-400 text-base mt-2 font-medium">{accounts.length} business partners</p>
                </div>
                {hasPermission('accounts.create') && (
                    <button className="btn-primary shadow-lg shadow-indigo-500/20 px-6 py-3" onClick={() => setShowForm(true)}>
                        <span className="text-xl leading-none mb-0.5">+</span> New Account
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="mb-10">
                <div className="relative max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 group-focus-within:text-indigo-400 transition-colors text-sm">🔍</span>
                    </div>
                    <input
                        className="input-field pl-10 py-2.5 shadow-sm bg-slate-800/50 border-slate-700 focus:bg-slate-800 transition-all text-sm"
                        placeholder="Search by name or industry…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-24">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-slate-400 text-sm">Refreshing accounts…</p>
                </div>
            ) : accounts.length === 0 ? (
                <div className="glass-card p-16 text-center max-w-lg mx-auto mt-8 border border-white/5 bg-slate-800/40">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-4xl opacity-80">🏢</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No accounts found</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                        {search ? 'Try adjusting your search terms.' : 'No accounts yet. Create your first one to organize your customer base.'}
                    </p>
                    {!search && hasPermission('accounts.create') && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            Create Account
                        </button>
                    )}
                </div>
            ) : (
                /* Account cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((a, i) => (
                        <div
                            key={a.id}
                            className="glass-card p-6 animate-slide-up hover:scale-[1.02] transition-transform duration-200 border border-white/5 hover:border-white/10"
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <Link
                                    to={`/accounts/${a.id}`}
                                    className="text-xl font-bold text-white hover:text-indigo-400 transition-colors tracking-tight truncate pr-2"
                                >
                                    {a.name}
                                </Link>
                                <div className="flex gap-1 shrink-0">
                                    {hasPermission('accounts.update') && (
                                        <button
                                            onClick={() => setEditingAccount(a)}
                                            className="text-slate-500 hover:text-indigo-400 transition-colors text-sm p-1.5 rounded hover:bg-white/5"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {hasPermission('accounts.delete') && (
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors text-sm p-1.5 rounded hover:bg-white/5"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-400">
                                {a.industry && (
                                    <div className="pb-1">
                                        <span className="badge badge-qualification shadow-sm text-[10px]">{a.industry}</span>
                                    </div>
                                )}
                                {a.website && (
                                    <p className="flex items-center gap-2 truncate">
                                        <span className="opacity-50 text-xs text-[10px]">🌐</span>
                                        <a href={a.website} target="_blank" rel="noreferrer" className="hover:text-indigo-400 truncate">
                                            {a.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </p>
                                )}
                                {a.phone && (
                                    <p className="flex items-center gap-2">
                                        <span className="opacity-50 text-xs text-[10px]">📞</span> {a.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
