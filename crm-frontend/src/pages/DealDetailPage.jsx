import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dealsApi } from '../api';
import DealForm from '../components/DealForm';
import Timeline from '../components/Timeline';

export default function DealDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        setLoading(true);
        try {
            const d = await dealsApi.get(id);
            setDeal(d);
        } catch {
            navigate('/deals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleUpdate = async (data) => {
        await dealsApi.update(id, data);
        setEditing(false);
        fetchData();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this deal?')) return;
        await dealsApi.delete(id);
        navigate('/deals');
    };

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading…</div>;
    }

    if (editing) {
        return <DealForm deal={deal} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />;
    }

    return (
        <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link to="/deals" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    ← Back to Deals
                </Link>
            </div>

            {/* Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{deal.title}</h1>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                            <span className="font-mono text-emerald-400 font-bold text-lg">{formatCurrency(deal.value)}</span>
                            <span className={`badge badge-${deal.stage}`}>{deal.stage.replace('_', ' ')}</span>
                            {deal.account_name && <span>🏢 {deal.account_name}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
                        <button className="btn-danger" onClick={handleDelete}>🗑️ Delete</button>
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
                <div className="glass-card p-5">
                    <h2 className="text-lg font-bold mb-4">Deal Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Contact</p>
                            <Link to={`/contacts/${deal.contact_id}`} className="text-indigo-400 hover:underline">
                                View Contact
                            </Link>
                        </div>
                        <div>
                            <p className="text-slate-500">Pipeline Stage</p>
                            <p className="text-slate-300">{deal.stage.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Created At</p>
                            <p className="text-slate-300">{new Date(deal.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <Timeline relatedToType="deal" relatedToId={id} />
            )}
        </div>
    );
}
