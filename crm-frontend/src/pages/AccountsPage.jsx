import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { accountsApi } from '../api';
import AccountForm from '../components/AccountForm';
import { useAuth } from '../context/AuthContext';

// Avatar gradient generator (reused)
const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #0071E3, #32ADE6)',
        'linear-gradient(135deg, #FF9F0A, #FF3B30)',
        'linear-gradient(135deg, #30D158, #32ADE6)',
        'linear-gradient(135deg, #5E5CE6, #FF2D55)',
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
        <div className="animate-fade-in pb-12">

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-[40px] font-bold text-apple-text tracking-tight mb-2">Accounts</h1>
                    <p className="text-[17px] text-apple-gray">
                        <span className="font-semibold text-apple-text">{accounts.length}</span> business partners
                    </p>
                </div>
                {hasPermission('accounts.create') && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Account
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[24px] shadow-apple-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input
                        className="w-full bg-apple-bg rounded-full pl-11 pr-4 py-3 text-[15px] focus:outline-none focus:border-apple-blue border border-transparent transition-all placeholder:text-apple-gray"
                        type="text"
                        placeholder="Search accounts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="bg-white rounded-[24px] shadow-apple-sm p-16 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-2 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-apple-gray text-[15px] font-medium">Loading accounts...</p>
                </div>
            ) : accounts.length === 0 ? (
                <div className="bg-white rounded-[24px] shadow-apple-sm p-16 text-center">
                    <div className="w-16 h-16 bg-apple-bg rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-[32px] opacity-70">🏢</span>
                    </div>
                    <h3 className="text-[20px] font-semibold text-apple-text mb-2">No accounts found</h3>
                    <p className="text-apple-gray max-w-sm mx-auto text-[15px] mb-8">
                        {search
                            ? 'No results match your search. Try adjusting your terms.'
                            : 'Get started by creating your first account.'}
                    </p>
                    {!search && hasPermission('accounts.create') && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            Create Account
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[24px] shadow-apple-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg w-12"><input type="checkbox" className="rounded text-apple-blue focus:ring-apple-blue w-4 h-4 cursor-pointer" /></th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg">Name</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg">Industry</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg">Website</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg">Phone</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg">Created</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-apple-gray uppercase tracking-wider border-b border-apple-bg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAccounts.map((a) => (
                                    <tr key={a.id} className="group hover:bg-apple-bg transition-colors cursor-pointer border-b border-apple-bg last:border-0">
                                        <td className="py-4 px-6"><input type="checkbox" className="rounded text-apple-blue focus:ring-apple-blue w-4 h-4 cursor-pointer" /></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-[14px] shrink-0" style={{ background: getAvatarGradient(a.name) }}>
                                                    {a.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <Link to={`/accounts/${a.id}`} className="font-medium text-[15px] text-apple-text hover:text-apple-blue transition-colors">
                                                    {a.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {a.industry ? (
                                                <span className="badge" style={{ background: '#F5F5F7', color: '#6E6E73' }}>
                                                    {a.industry}
                                                </span>
                                            ) : (
                                                <span className="text-apple-gray italic text-[14px]">--</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-apple-gray">
                                            {a.website ? (
                                                <a
                                                    href={a.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 hover:text-apple-blue transition-colors"
                                                >
                                                    <span className="text-[10px] opacity-70">↗</span>
                                                    {a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                </a>
                                            ) : (
                                                <span className="text-apple-gray italic text-[14px]">--</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-apple-gray">
                                            {a.phone || <span className="text-apple-gray italic text-[14px]">--</span>}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-apple-gray">
                                            {new Date(a.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hasPermission('accounts.update') && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setEditingAccount(a); }}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-apple-bg text-apple-gray hover:bg-white hover:text-apple-text shadow-sm transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                    </button>
                                                )}
                                                <Link to={`/accounts/${a.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-apple-bg text-apple-gray hover:bg-apple-blue hover:text-white shadow-sm transition-all">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-apple-bg flex items-center justify-between text-[14px]">
                        <div className="text-apple-gray font-medium">
                            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, accounts.length)} of {accounts.length} accounts
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center border border-apple-border text-apple-gray hover:bg-apple-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-apple-blue text-white font-medium">{page}</button>
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center border border-apple-border text-apple-gray hover:bg-apple-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPage(p => (p * pageSize < accounts.length ? p + 1 : p))}
                                disabled={page * pageSize >= accounts.length}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
