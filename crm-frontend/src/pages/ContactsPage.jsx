import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '../api';
import ContactForm from '../components/ContactForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Avatar gradient generator
const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #E63946, #D62828)', // blue
        'linear-gradient(135deg, #FF9F0A, #FF3B30)', // orange-red
        'linear-gradient(135deg, #30D158, #D62828)', // green-blue
        'linear-gradient(135deg, #5E5CE6, #FF2D55)', // purple-pink
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

    // Pagination state
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
        <div className="animate-fade-in pb-12">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-[40px] font-bold text-zazmic-black tracking-tight mb-2">Contacts</h1>
                    <p className="text-[17px] text-zazmic-gray-500">
                        <span className="font-semibold text-zazmic-black">{contacts.length}</span> people in your network
                    </p>
                </div>
                {hasPermission('contacts.create') && (
                    <button
                        className="btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Contact
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[24px] shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zazmic-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input
                        className="w-full bg-zazmic-gray-100 rounded-full pl-11 pr-4 py-3 text-[15px] focus:outline-none focus:border-zazmic-red border border-transparent transition-all placeholder:text-zazmic-gray-500"
                        type="text"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="bg-white rounded-[24px] shadow-sm p-16 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-2 border-zazmic-red border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zazmic-gray-500 text-[15px] font-medium">Loading contacts...</p>
                </div>
            ) : contacts.length === 0 ? (
                <div className="bg-white rounded-[24px] shadow-sm p-16 text-center">
                    <div className="w-16 h-16 bg-zazmic-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-[32px] opacity-70">👥</span>
                    </div>
                    <h3 className="text-[20px] font-semibold text-zazmic-black mb-2">No contacts found</h3>
                    <p className="text-zazmic-gray-500 max-w-sm mx-auto text-[15px] mb-8">
                        {search
                            ? 'No results match your search. Try adjusting your terms.'
                            : 'Get started by adding your first contact.'}
                    </p>
                    {!search && hasPermission('contacts.create') && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            Create Contact
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100 w-12"><input type="checkbox" className="rounded text-zazmic-red focus:ring-zazmic-red w-4 h-4 cursor-pointer" /></th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Name</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Email</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Phone</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Company</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Created</th>
                                    <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedContacts.map((c) => (
                                    <tr key={c.id} className="group hover:bg-zazmic-gray-100 transition-colors cursor-pointer border-b border-zazmic-gray-100 last:border-0">
                                        <td className="py-4 px-6"><input type="checkbox" className="rounded text-zazmic-red focus:ring-zazmic-red w-4 h-4 cursor-pointer" /></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-[14px] shrink-0" style={{ background: getAvatarGradient(c.name) }}>
                                                    {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <Link to={`/contacts/${c.id}`} className="font-medium text-[15px] text-zazmic-black hover:text-zazmic-red transition-colors">
                                                    {c.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">{c.email}</td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">{c.phone || '--'}</td>
                                        <td className="py-4 px-6">
                                            {c.company ? (
                                                <span className="badge" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                                                    {c.company}
                                                </span>
                                            ) : (
                                                <span className="text-zazmic-gray-500 italic text-[14px]">--</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {hasPermission('contacts.update') && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setEditingContact(c); }}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zazmic-gray-100 text-zazmic-gray-500 hover:bg-white hover:text-zazmic-black shadow-sm transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                    </button>
                                                )}
                                                <Link to={`/contacts/${c.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zazmic-gray-100 text-zazmic-gray-500 hover:bg-zazmic-red hover:text-white shadow-sm transition-all">
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
                    <div className="px-6 py-4 border-t border-zazmic-gray-100 flex items-center justify-between text-[14px]">
                        <div className="text-zazmic-gray-500 font-medium">
                            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, contacts.length)} of {contacts.length} contacts
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center border border-zazmic-gray-300 text-zazmic-gray-500 hover:bg-zazmic-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-zazmic-red text-white font-medium">{page}</button>
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center border border-zazmic-gray-300 text-zazmic-gray-500 hover:bg-zazmic-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setPage(p => (p * pageSize < contacts.length ? p + 1 : p))}
                                disabled={page * pageSize >= contacts.length}
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
