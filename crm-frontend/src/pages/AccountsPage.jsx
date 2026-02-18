import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { accountsApi } from '../api';
import AccountForm from '../components/AccountForm';

export default function AccountsPage() {
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
        return <AccountForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    if (editingAccount) {
        return (
            <AccountForm
                account={editingAccount}
                onSubmit={handleUpdate}
                onCancel={() => setEditingAccount(null)}
            />
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Accounts</h1>
                    <p className="text-slate-400 text-sm mt-1">{accounts.length} total accounts</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + New Account
                </button>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <input
                    className="input-field max-w-md"
                    placeholder="🔍  Search by name or industry…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading accounts…</div>
            ) : accounts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">🏢</p>
                    <p className="text-slate-400">
                        {search ? 'No accounts match your search.' : 'No accounts yet. Create your first one!'}
                    </p>
                </div>
            ) : (
                /* Account cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((a, i) => (
                        <div
                            key={a.id}
                            className="glass-card p-5 animate-slide-up"
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Link
                                    to={`/accounts/${a.id}`}
                                    className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors"
                                >
                                    {a.name}
                                </Link>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setEditingAccount(a)}
                                        className="text-slate-500 hover:text-indigo-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm text-slate-400">
                                {a.industry && (
                                    <p>
                                        <span className="badge badge-qualification">{a.industry}</span>
                                    </p>
                                )}
                                {a.website && (
                                    <p>
                                        🌐 <a href={a.website} target="_blank" rel="noreferrer" className="hover:text-indigo-400">{a.website}</a>
                                    </p>
                                )}
                                {a.phone && <p>📞 {a.phone}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
