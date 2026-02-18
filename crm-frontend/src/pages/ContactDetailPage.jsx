import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contactsApi, dealsApi, activitiesApi } from '../api';
import ContactForm from '../components/ContactForm';
import Timeline from '../components/Timeline';
import AssignOwner from '../components/AssignOwner';

export default function ContactDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = useState(null);
    const [deals, setDeals] = useState([]);
    const [activities, setActivities] = useState([]);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [c, d, a] = await Promise.all([
                contactsApi.get(id),
                dealsApi.list({ contact_id: id }),
                activitiesApi.list({ contact_id: id }),
            ]);
            setContact(c);
            setDeals(d);
            setActivities(a);
        } catch {
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleUpdate = async (data) => {
        await contactsApi.update(id, data);
        setEditing(false);
        fetchData();
    };

    const handleAssign = async (userId) => {
        await contactsApi.assign(id, userId);
        fetchData();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this contact?')) return;
        await contactsApi.delete(id);
        navigate('/');
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading…</div>;
    }

    if (editing) {
        return <ContactForm contact={contact} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />;
    }

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    ← Back to Contacts
                </Link>
                <AssignOwner currentOwnerId={contact.owner_id} onAssign={handleAssign} />
            </div>

            {/* Contact Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{contact.name}</h1>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                            <span>✉️ {contact.email}</span>
                            {contact.phone && <span>📞 {contact.phone}</span>}
                            {contact.company && (
                                <span className="badge badge-qualification">{contact.company}</span>
                            )}
                        </div>
                        {contact.notes && <p className="mt-3 text-sm text-slate-500">{contact.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
                        <button className="btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-700/50">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-400">{deals.length}</p>
                        <p className="text-xs text-slate-400 mt-1">Deals</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(totalValue)}</p>
                        <p className="text-xs text-slate-400 mt-1">Total Value</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{activities.length}</p>
                        <p className="text-xs text-slate-400 mt-1">Activities</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-700/50 mb-6 px-1">
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'overview' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'timeline' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                    onClick={() => setActiveTab('timeline')}
                >
                    Timeline
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deals */}
                    <div className="glass-card p-5">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            📊 Deals
                        </h2>
                        {deals.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No deals yet</p>
                        ) : (
                            <div className="space-y-3">
                                {deals.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                        <div>
                                            <p className="font-medium text-sm">{d.title}</p>
                                            <span className={`badge badge-${d.stage} mt-1`}>{d.stage.replace('_', ' ')}</span>
                                        </div>
                                        <p className="font-semibold text-green-400">{formatCurrency(d.value)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activities */}
                    <div className="glass-card p-5">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            📋 Activity Log
                        </h2>
                        {activities.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No activities yet</p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((a) => (
                                    <div key={a.id} className="p-3 rounded-lg bg-slate-800/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`badge badge-${a.type}`}>{a.type}</span>
                                                <p className="font-medium text-sm">{a.subject}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">{formatDate(a.date)}</p>
                                        </div>
                                        {a.description && (
                                            <p className="text-xs text-slate-400 mt-1">{a.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <Timeline relatedToType="contact" relatedToId={id} />
            )}
        </div>
    );
}
