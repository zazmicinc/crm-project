import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '../api';
import ContactForm from '../components/ContactForm';
import { useAuth } from '../context/AuthContext';

export default function ContactsPage() {
    const { hasPermission } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [loading, setLoading] = useState(true);

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
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Contacts</h1>
                    <p className="text-slate-400 text-base mt-2 font-medium">{contacts.length} people in your network</p>
                </div>
                {hasPermission('contacts.create') && (
                    <button className="btn-primary shadow-lg shadow-indigo-500/20 px-6 py-3" onClick={() => setShowForm(true)}>
                        <span className="text-xl leading-none mb-0.5">+</span> New Contact
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
                        placeholder="Search by name, email, or company…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-24">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-slate-400 text-sm">Refreshing contacts…</p>
                </div>
            ) : contacts.length === 0 ? (
                <div className="glass-card p-16 text-center max-w-lg mx-auto mt-8 border border-white/5 bg-slate-800/40">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-4xl opacity-80">👥</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No contacts found</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                        {search ? 'Try adjusting your search terms.' : 'No contacts yet. Create your first one to start building relationships.'}
                    </p>
                    {!search && hasPermission('contacts.create') && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            Create Contact
                        </button>
                    )}
                </div>
            ) : (
                /* Contact cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map((c, i) => (
                        <div
                            key={c.id}
                            className="glass-card p-6 animate-slide-up hover:scale-[1.02] transition-transform duration-200 border border-white/5 hover:border-white/10"
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <Link
                                    to={`/contacts/${c.id}`}
                                    className="text-xl font-bold text-white hover:text-indigo-400 transition-colors tracking-tight truncate pr-2"
                                >
                                    {c.name}
                                </Link>
                                <div className="flex gap-1 shrink-0">
                                    {hasPermission('contacts.update') && (
                                        <button
                                            onClick={() => setEditingContact(c)}
                                            className="text-slate-500 hover:text-indigo-400 transition-colors text-sm p-1.5 rounded hover:bg-white/5"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                    {hasPermission('contacts.delete') && (
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors text-sm p-1.5 rounded hover:bg-white/5"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-400">
                                <p className="flex items-center gap-2 truncate">
                                    <span className="opacity-50">✉️</span> {c.email}
                                </p>
                                {c.phone && (
                                    <p className="flex items-center gap-2">
                                        <span className="opacity-50">📞</span> {c.phone}
                                    </p>
                                )}
                                {c.company && (
                                    <div className="pt-1">
                                        <span className="badge badge-qualification shadow-sm text-[10px]">{c.company}</span>
                                    </div>
                                )}
                            </div>
                            {c.notes && (
                                <p className="mt-4 text-[11px] text-slate-500 line-clamp-2 border-t border-white/5 pt-3 leading-relaxed">
                                    {c.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
