import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '../api';
import ContactForm from '../components/ContactForm';

export default function ContactsPage() {
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
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <p className="text-slate-400 text-sm mt-1">{contacts.length} total contacts</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + New Contact
                </button>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <input
                    className="input-field max-w-md"
                    placeholder="🔍  Search by name, email, or company…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading contacts…</div>
            ) : contacts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-slate-400">
                        {search ? 'No contacts match your search.' : 'No contacts yet. Create your first one!'}
                    </p>
                </div>
            ) : (
                /* Contact cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((c, i) => (
                        <div
                            key={c.id}
                            className="glass-card p-5 animate-slide-up"
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Link
                                    to={`/contacts/${c.id}`}
                                    className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors"
                                >
                                    {c.name}
                                </Link>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setEditingContact(c)}
                                        className="text-slate-500 hover:text-indigo-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-sm text-slate-400">
                                <p>✉️ {c.email}</p>
                                {c.phone && <p>📞 {c.phone}</p>}
                                {c.company && (
                                    <p>
                                        <span className="badge badge-qualification">{c.company}</span>
                                    </p>
                                )}
                            </div>
                            {c.notes && (
                                <p className="mt-3 text-xs text-slate-500 line-clamp-2 border-t border-slate-700/50 pt-2">
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
