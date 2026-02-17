import { useState, useEffect, useCallback } from 'react';
import { dealsApi } from '../api';
import DealForm from '../components/DealForm';

const PIPELINE_STAGES = [
    { key: 'prospecting', label: 'Lead', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30' },
    { key: 'qualification', label: 'Qualified', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30' },
    { key: 'proposal', label: 'Proposal', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30' },
    { key: 'negotiation', label: 'Negotiation', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30' },
    { key: 'closed_won', label: 'Won', color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30' },
    { key: 'closed_lost', label: 'Lost', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30' },
];

export default function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const data = await dealsApi.list();
            setDeals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDeals(); }, [fetchDeals]);

    const handleCreate = async (data) => {
        await dealsApi.create(data);
        setShowForm(false);
        fetchDeals();
    };

    const handleUpdate = async (data) => {
        await dealsApi.update(editingDeal.id, data);
        setEditingDeal(null);
        fetchDeals();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this deal?')) return;
        await dealsApi.delete(id);
        fetchDeals();
    };

    const handleStageChange = async (deal, newStage) => {
        await dealsApi.update(deal.id, { stage: newStage });
        fetchDeals();
    };

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    const groupedDeals = PIPELINE_STAGES.map((stage) => ({
        ...stage,
        deals: deals.filter((d) => d.stage === stage.key),
        total: deals.filter((d) => d.stage === stage.key).reduce((sum, d) => sum + d.value, 0),
    }));

    if (showForm) return <DealForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    if (editingDeal) return <DealForm deal={editingDeal} onSubmit={handleUpdate} onCancel={() => setEditingDeal(null)} />;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Deals Pipeline</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {deals.length} deals · {formatCurrency(deals.reduce((s, d) => s + d.value, 0))} total
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + New Deal
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading pipeline…</div>
            ) : (
                /* Kanban Board — horizontal scroll on mobile */
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                    {groupedDeals.map((stage) => (
                        <div
                            key={stage.key}
                            className={`kanban-column min-w-[280px] flex-1 snap-start bg-gradient-to-b ${stage.color}`}
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-sm">{stage.label}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {stage.deals.length} deals · {formatCurrency(stage.total)}
                                    </p>
                                </div>
                                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color} border ${stage.border}`} />
                            </div>

                            {/* Cards */}
                            {stage.deals.length === 0 ? (
                                <p className="text-xs text-slate-600 text-center py-8">No deals</p>
                            ) : (
                                stage.deals.map((deal) => (
                                    <div key={deal.id} className="kanban-card group">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-sm leading-tight">{deal.title}</h4>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingDeal(deal)}
                                                    className="text-xs px-1.5 py-0.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-white/5"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deal.id)}
                                                    className="text-xs px-1.5 py-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-white/5"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-green-400 mb-3">
                                            {formatCurrency(deal.value)}
                                        </p>

                                        {/* Quick stage-move buttons */}
                                        <div className="flex flex-wrap gap-1">
                                            {PIPELINE_STAGES.filter((s) => s.key !== stage.key).map((s) => (
                                                <button
                                                    key={s.key}
                                                    onClick={() => handleStageChange(deal, s.key)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full border ${s.border} text-slate-400 hover:text-white transition-colors`}
                                                    title={`Move to ${s.label}`}
                                                >
                                                    → {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
