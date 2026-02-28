import { useState, useEffect, useCallback } from 'react';
import { dealsApi } from '../api';
import DealForm from '../components/DealForm';
import { motion, AnimatePresence } from 'framer-motion';

const PIPELINE_STAGES = [
    { key: 'prospecting', label: 'Lead', color: '#E63946' }, // blue
    { key: 'qualification', label: 'Qualified', color: '#A855F7' }, // purple
    { key: 'proposal', label: 'Proposal', color: '#FF9F0A' }, // warning/orange
    { key: 'negotiation', label: 'Negotiation', color: '#FF3B30' }, // danger/red
    { key: 'closed_won', label: 'Won', color: '#30D158' }, // success/green
    { key: 'closed_lost', label: 'Lost', color: '#6B7280' }, // gray
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
        <div className="animate-fade-in pb-12 w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-[40px] font-bold text-zazmic-black tracking-tight mb-2">Deals Pipeline</h1>
                    <p className="text-[17px] text-zazmic-gray-500">
                        <span className="font-semibold text-zazmic-black">{deals.length}</span> deals · <span className="font-semibold text-zazmic-black">{formatCurrency(deals.reduce((s, d) => s + d.value, 0))}</span> total
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Deal
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-[24px] shadow-sm p-16 flex flex-col items-center justify-center space-y-4 max-w-4xl mx-auto">
                    <div className="w-8 h-8 border-2 border-zazmic-red border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zazmic-gray-500 text-[15px] font-medium">Loading pipeline...</p>
                </div>
            ) : (
                /* Kanban Board — horizontal scroll with snap */
                <div className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x snap-mandatory">
                    {groupedDeals.map((stage) => (
                        <div
                            key={stage.key}
                            className="w-[320px] min-w-[320px] shrink-0 snap-start bg-[#F3F4F6] rounded-[24px] p-4 border border-zazmic-gray-300/50 flex flex-col h-[calc(100vh-280px)] min-h-[600px] overflow-hidden"
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-[15px] text-zazmic-black uppercase tracking-widest">{stage.label}</h3>
                                        <span className="bg-white shadow-sm border border-zazmic-gray-300 rounded-full px-2 py-0.5 text-[12px] font-bold text-zazmic-black">
                                            {stage.deals.length}
                                        </span>
                                    </div>
                                    <p className="text-[14px] text-zazmic-gray-500 mt-1 font-medium">
                                        {formatCurrency(stage.total)}
                                    </p>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                            </div>

                            {/* Cards Area (scrollable independent of columns) */}
                            <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-3 custom-scrollbar">
                                <AnimatePresence>
                                    {stage.deals.length === 0 ? (
                                        <div className="text-[14px] text-zazmic-gray-500 text-center py-8">No deals</div>
                                    ) : (
                                        stage.deals.map((deal) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                key={deal.id}
                                                className="bg-white rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-black/5"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-semibold text-[17px] leading-tight text-zazmic-black pr-4">{deal.title}</h4>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingDeal(deal); }}
                                                            className="text-zazmic-gray-500 hover:text-zazmic-red transition-colors p-1"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                                                            className="text-zazmic-gray-500 hover:text-danger transition-colors p-1"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-[20px] font-bold text-zazmic-black mb-4 tracking-tight">
                                                    {formatCurrency(deal.value)}
                                                </p>

                                                <div className="flex items-center text-[13px] text-zazmic-gray-500 mb-3 pb-3 border-b border-[#F3F4F6]">
                                                    <span className="truncate">{deal.contact?.name || deal.account?.name || 'No assigned entity'}</span>
                                                </div>

                                                {/* Quick move buttons - visible on hover or focus */}
                                                <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                                                    {PIPELINE_STAGES.filter((s) => s.key !== stage.key).map((s) => (
                                                        <button
                                                            key={s.key}
                                                            onClick={(e) => { e.stopPropagation(); handleStageChange(deal, s.key); }}
                                                            className="text-[11px] px-2 py-1 rounded bg-[#F3F4F6] text-zazmic-gray-500 hover:bg-zazmic-red hover:text-white transition-colors"
                                                            title={`Move to ${s.label}`}
                                                        >
                                                            {s.label} →
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
