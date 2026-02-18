import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '../api';
import ContactForm from '../components/ContactForm';
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

export default function ContactsPage() {
    const { hasPermission } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination state (visual placeholder)
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

    const handleDelete = async (id) => {
        if (!confirm('Delete this contact and all associated deals/activities?')) return;
        await contactsApi.delete(id);
        fetchContacts();
    };

    const paginatedContacts = contacts.slice((page - 1) * pageSize, page * pageSize);

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

    return (
        <div className="crm-page-container">
            <div className="crm-page-content">
                
                {/* Header */}
                <div className="crm-page-header">
                    <div>
                        <h1 className="crm-page-title">Contacts</h1>
                        <p className="crm-page-subtitle">
                            <span>{contacts.length}</span> people in your network
                        </p>
                    </div>
                    {hasPermission('contacts.create') && (
                        <button 
                            className="crm-btn-primary"
                            onClick={() => setShowForm(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            New Contact
                        </button>
                    )}
                </div>

                {/* Toolbar */}
                <div className="crm-toolbar">
                    <div className="crm-search-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading contacts...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="crm-glass-card p-16 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl opacity-50">👥</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No contacts found</h3>
                        <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed mb-8">
                            {search 
                                ? 'No results match your search. Try adjusting your terms.' 
                                : 'Get started by adding your first contact.'}
                        </p>
                        {!search && hasPermission('contacts.create') && (
                            <button className="crm-btn-primary" onClick={() => setShowForm(true)}>
                                Create Contact
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th" style={{ paddingLeft: '32px' }}>Name</th>
                                    <th className="crm-th">Email</th>
                                    <th className="crm-th">Phone</th>
                                    <th className="crm-th">Company</th>
                                    <th className="crm-th" style={{ textAlign: 'right' }}>Created</th>
                                    <th className="crm-th" style={{ textAlign: 'right', paddingRight: '32px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {paginatedContacts.map((c) => (
                                    <tr key={c.id}>
                                        <td className="crm-td" style={{ paddingLeft: '32px' }}>
                                            <div className="crm-item-name">
                                                <div className="crm-item-avatar" style={{ background: getAvatarGradient(c.name) }}>
                                                    {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="crm-item-name-text">
                                                    <Link to={`/contacts/${c.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {c.name}
                                                    </Link>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="crm-td crm-td-secondary">{c.email}</td>
                                        <td className="crm-td crm-td-secondary">{c.phone || '--'}</td>
                                        <td className="crm-td">
                                            {c.company ? (
                                                <span className="crm-badge crm-badge-new" style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#cbd5e1' }}>
                                                    {c.company}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 italic text-xs">--</span>
                                            )}
                                        </td>
                                        <td className="crm-td crm-td-date" style={{ textAlign: 'right' }}>
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="crm-td" style={{ paddingRight: '32px' }}>
                                            <div className="crm-actions">
                                                {hasPermission('contacts.update') && (
                                                    <button 
                                                        onClick={() => setEditingContact(c)}
                                                        className="crm-btn-action-icon"
                                                        title="Edit"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                    </button>
                                                )}
                                                <Link to={`/contacts/${c.id}`} style={{ textDecoration: 'none' }}>
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
                                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, contacts.length)} of {contacts.length} contacts
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
                                    onClick={() => setPage(p => (p * pageSize < contacts.length ? p + 1 : p))}
                                    disabled={page * pageSize >= contacts.length}
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
