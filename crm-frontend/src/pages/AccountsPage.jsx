import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../api';
import AccountForm from '../components/AccountForm';
import { useAuth } from '../context/AuthContext';
import { ListTable } from '../components/shared/ListTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate } from '../utils/formatDate';

const ACCOUNT_TYPE_STYLE = {
    Customer: { bg: '#f0fff4', color: '#1a7f4b', dot: '#27ae60' },
    Partner:  { bg: '#f0f4ff', color: '#1a3f9f', dot: '#3b5de7' },
    Prospect: { bg: '#f9fafb', color: '#6b7280', dot: '#9ca3af' },
};

function AccountTypeBadge({ type }) {
    const cfg = ACCOUNT_TYPE_STYLE[type] || ACCOUNT_TYPE_STYLE.Prospect;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.bg, color: cfg.color,
            padding: '4px 10px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            {type || 'Prospect'}
        </span>
    );
}

const columns = [
    {
        key: 'name', label: 'Account Name', width: '1fr',
        render: (a) => (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                {a.name}
            </span>
        )
    },
    {
        key: 'type', label: 'Type', width: '120px',
        render: (a) => <AccountTypeBadge type={a.account_type} />
    },
    {
        key: 'industry', label: 'Industry', width: '1fr',
        render: (a) => <span style={{ fontSize: 13, color: '#666' }}>{a.industry || '—'}</span>
    },
    {
        key: 'website', label: 'Website', width: '1fr',
        render: (a) => a.website ? (
            <a
                href={a.website}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}
            >
                {a.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
        ) : <span style={{ fontSize: 13, color: '#aaa' }}>—</span>
    },
    {
        key: 'phone', label: 'Phone', width: '140px',
        render: (a) => <span style={{ fontSize: 13, color: '#888' }}>{a.phone || '—'}</span>
    },
    {
        key: 'created', label: 'Created', width: '120px',
        render: (a) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(a.created_at)}</span>
    },
];

export default function AccountsPage() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const paginatedAccounts = accounts.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(accounts.length / pageSize);

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

    const headerExtra = (
        <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
                style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, width: 200, outline: 'none' }}
                type="text"
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
        </div>
    );

    return (
        <div className="animate-fade-in pb-12">
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                    <div style={{ width: 28, height: 28, border: '2px solid #e8192c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <p style={{ fontSize: 14, color: '#aaa' }}>Loading accounts...</p>
                </div>
            ) : (
                <ListTable
                    title="All Accounts"
                    breadcrumb="CRM / Accounts"
                    columns={columns}
                    rows={paginatedAccounts}
                    newButtonLabel="+ New Account"
                    onNew={hasPermission('accounts.create') ? () => setShowForm(true) : () => {}}
                    onRowClick={(a) => navigate(`/accounts/${a.id}`)}
                    totalCount={accounts.length}
                    currentPage={page}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    headerExtra={headerExtra}
                />
            )}
        </div>
    );
}
