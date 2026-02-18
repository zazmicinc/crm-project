import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { accountsApi } from '../api';
import AccountForm from '../components/AccountForm';
import { useAuth } from '../context/AuthContext';

// Avatar gradient generator (reused)
const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #3b82f6, #6366f1)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #10b981, #3b82f6)',
        'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'linear-gradient(135deg, #06b6d4, #6366f1)',
        'linear-gradient(135deg, #f97316, #f59e0b)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        'linear-gradient(135deg, #ef4444, #f97316)',
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
    ];
    if (!name) return gradients[0];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
};

export default function AccountsPage() {
    const { hasPermission } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 10;

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

    const paginatedAccounts = accounts.slice((page - 1) * pageSize, page * pageSize);

    if (showForm) {
        return <AccountForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
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
        <div className="crm-page-container">
            <div className="crm-page-content">
                
                {/* Header Row */}
                <div className="crm-page-header">
                    <div>
                        <h1 className="crm-page-title">Accounts</h1>
                        <p className="crm-page-subtitle">
                            <span>{accounts.length}</span> business partners
                        </p>
                    </div>
                    {hasPermission('accounts.create') && (
                        <button 
                            className="crm-btn-primary"
                            onClick={() => setShowForm(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            New Account
                        </button>
                    )}
                </div>

                {/* Toolbar */}
                <div className="crm-toolbar">
                    <div className="crm-search-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading accounts...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="crm-glass-card p-16 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl opacity-50">🏢</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No accounts found</h3>
                        <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed mb-8">
                            {search 
                                ? 'No results match your search. Try adjusting your terms.' 
                                : 'Get started by creating your first account.'}
                        </p>
                        {!search && hasPermission('accounts.create') && (
                            <button className="crm-btn-primary" onClick={() => setShowForm(true)}>
                                Create Account
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th" style={{ paddingLeft: '32px' }}>Name</th>
                                    <th className="crm-th">Industry</th>
                                    <th className="crm-th">Website</th>
                                    <th className="crm-th">Phone</th>
                                    <th className="crm-th" style={{ textAlign: 'right' }}>Created</th>
                                    <th className="crm-th" style={{ textAlign: 'right', paddingRight: '32px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {paginatedAccounts.map((a) => (
                                    <tr key={a.id}>
                                        <td className="crm-td" style={{ paddingLeft: '32px' }}>
                                            <div className="crm-item-name">
                                                <div className="crm-item-avatar" style={{ background: getAvatarGradient(a.name) }}>
                                                    {a.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="crm-item-name-text">
                                                    <Link to={`/accounts/${a.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {a.name}
                                                    </Link>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="crm-td">
                                            {a.industry ? (
                                                <span className="crm-badge crm-badge-new" style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#cbd5e1' }}>
                                                    {a.industry}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 italic text-xs">--</span>
                                            )}
                                        </td>
                                        <td className="crm-td crm-td-secondary">
                                            {a.website ? (
                                                <a 
                                                    href={a.website} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <span style={{ opacity: 0.5, fontSize: '10px' }}>↗</span>
                                                    {a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                </a>
                                            ) : (
                                                <span className="text-slate-600 italic text-xs">--</span>
                                            )}
                                        </td>
                                        <td className="crm-td crm-td-secondary">
                                            {a.phone || <span className="text-slate-600 italic text-xs">--</span>}
                                        </td>
                                        <td className="crm-td crm-td-date" style={{ textAlign: 'right' }}>
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="crm-td" style={{ paddingRight: '32px' }}>
                                            <div className="crm-actions">
                                                {hasPermission('accounts.update') && (
                                                    <button 
                                                        onClick={() => setEditingAccount(a)}
                                                        className="crm-btn-action-icon"
                                                        title="Edit"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                    </button>
                                                )}
                                                <Link to={`/accounts/${a.id}`} style={{ textDecoration: 'none' }}>
                                                    <button className="crm-btn-action">Detail</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        <div className="crm-pagination">
                            <div className="crm-pagination-info">
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, accounts.length)} of {accounts.length} accounts
                            </div>
                            <div className="crm-pagination-controls">
                                <button 
                                    className="crm-page-btn" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    ‹
                                </button>
                                <button className="crm-page-btn active">{page}</button>
                                <button 
                                    className="crm-page-btn"
                                    onClick={() => setPage(p => (p * pageSize < accounts.length ? p + 1 : p))}
                                    disabled={page * pageSize >= accounts.length}
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
