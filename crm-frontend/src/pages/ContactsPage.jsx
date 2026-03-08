import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../api';
import ContactForm from '../components/ContactForm';
import { useAuth } from '../context/AuthContext';
import { ListTable } from '../components/shared/ListTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate } from '../utils/formatDate';

const columns = [
    {
        key: 'name', label: 'Name', width: '1fr',
        render: (c) => (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                {c.name}
            </span>
        )
    },
    {
        key: 'email', label: 'Email', width: '1fr',
        render: (c) => <span style={{ fontSize: 13, color: '#666' }}>{c.email}</span>
    },
    {
        key: 'phone', label: 'Phone', width: '140px',
        render: (c) => <span style={{ fontSize: 13, color: '#888' }}>{c.phone || '—'}</span>
    },
    {
        key: 'company', label: 'Company', width: '1fr',
        render: (c) => <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{c.company || '—'}</span>
    },
    {
        key: 'status', label: 'Status', width: '130px',
        render: (c) => c.status ? <StatusBadge status={c.status} /> : <span style={{ fontSize: 13, color: '#aaa' }}>—</span>
    },
    {
        key: 'created', label: 'Created', width: '120px',
        render: (c) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(c.created_at)}</span>
    },
];

export default function ContactsPage() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const data = await contactsApi.list(params);
            setContacts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchContacts, 300);
        return () => clearTimeout(timer);
    }, [fetchContacts]);

    const handleCreate = async (data) => {
        await contactsApi.create(data);
        setShowForm(false);
        fetchContacts();
    };

    const handleUpdate = async (data) => {
        await contactsApi.update(editingContact.id, data);
        setEditingContact(null);
        fetchContacts();
    };

    const paginatedContacts = contacts.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(contacts.length / pageSize);

    if (showForm) {
        return <ContactForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    if (editingContact) {
        return (
            <ContactForm
                contact={editingContact}
                onSubmit={handleUpdate}
                onCancel={() => setEditingContact(null)}
            />
        );
    }

    const headerExtra = (
        <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
                style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, width: 200, outline: 'none' }}
                type="text"
                placeholder="Search contacts..."
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
                    <p style={{ fontSize: 14, color: '#aaa' }}>Loading contacts...</p>
                </div>
            ) : (
                <ListTable
                    title="All Contacts"
                    breadcrumb="CRM / Contacts"
                    columns={columns}
                    rows={paginatedContacts}
                    newButtonLabel="+ New Contact"
                    onNew={hasPermission('contacts.create') ? () => setShowForm(true) : () => {}}
                    onRowClick={(c) => navigate(`/contacts/${c.id}`)}
                    totalCount={contacts.length}
                    currentPage={page}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    headerExtra={headerExtra}
                />
            )}
        </div>
    );
}
