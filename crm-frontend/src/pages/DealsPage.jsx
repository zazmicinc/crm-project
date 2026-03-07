import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealsApi } from '../api';
import DealForm from '../components/DealForm';

const PIPELINE_STAGES = [
    { key: 'prospecting',   label: 'Prospecting',   color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'qualification', label: 'Qualification', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'proposal',      label: 'Proposal',      color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'negotiation',   label: 'Negotiation',   color: '#E63946', bg: '#FFF0F1' },
    { key: 'closed_won',    label: 'Closed Won',    color: '#10B981', bg: '#ECFDF5' },
    { key: 'closed_lost',   label: 'Closed Lost',   color: '#6B7280', bg: '#F9FAFB' },
];

export default function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleStageChange = async (deal, newStageKey) => {
        const payload = { stage: newStageKey };
        if (newStageKey === 'closed_lost' && !deal.loss_reason) {
            setEditingDeal({ ...deal, _pendingStage: newStageKey });
            return;
        }
        await dealsApi.update(deal.id, payload);
        fetchDeals();
    };

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    const groupedDeals = PIPELINE_STAGES.map((stage) => ({
        ...stage,
        deals: deals.filter((d) => d.stage === stage.key),
        total: deals.filter((d) => d.stage === stage.key).reduce((sum, d) => sum + d.value, 0),
    }));

    const totalPipelineValue = deals
        .filter((d) => d.stage !== 'closed_lost')
        .reduce((s, d) => s + d.value, 0);

    const wonValue = deals
        .filter((d) => d.stage === 'closed_won')
        .reduce((s, d) => s + d.value, 0);

    if (showForm) return <DealForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    if (editingDeal) return <DealForm deal={editingDeal} onSubmit={handleUpdate} onCancel={() => setEditingDeal(null)} />;

    return (
        <div style={{ fontFamily: 'var(--font-primary)', color: 'var(--zazmic-black)' }} className="pb-12">

            {/* ── Page Header ── */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
                        Deals Pipeline
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'var(--zazmic-gray-500)' }}>
                        <strong style={{ color: 'var(--zazmic-black)' }}>{deals.length}</strong> deals &nbsp;·&nbsp;
                        <strong style={{ color: 'var(--zazmic-black)' }}>{formatCurrency(totalPipelineValue)}</strong> in pipeline &nbsp;·&nbsp;
                        <strong style={{ color: '#10B981' }}>{formatCurrency(wonValue)}</strong> won
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Deal
                </button>
            </div>

            {/* ── Summary Strip ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {groupedDeals.map((stage) => (
                    <div
                        key={stage.key}
                        style={{
                            flex: '1 1 130px',
                            background: 'white',
                            border: `1px solid var(--zazmic-gray-300)`,
                            borderTop: `3px solid ${stage.color}`,
                            borderRadius: 8,
                            padding: '12px 16px',
                        }}
                    >
                        <p style={{ fontSize: 11, fontWeight: 600, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            {stage.label}
                        </p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--zazmic-black)', letterSpacing: '-0.03em' }}>
                            {stage.deals.length}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--zazmic-gray-500)', marginTop: 2 }}>
                            {formatCurrency(stage.total)}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Kanban Board ── */}
            {loading ? (
                <div style={{ background: 'white', borderRadius: 12, padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '1px solid var(--zazmic-gray-300)' }}>
                    <div style={{ width: 28, height: 28, border: '2px solid var(--zazmic-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <p style={{ fontSize: 14, color: 'var(--zazmic-gray-500)' }}>Loading pipeline…</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
                    {groupedDeals.map((stage) => (
                        <div
                            key={stage.key}
                            style={{
                                width: 280,
                                minWidth: 280,
                                flexShrink: 0,
                                background: stage.bg,
                                border: '1px solid var(--zazmic-gray-300)',
                                borderRadius: 12,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: 'calc(100vh - 320px)',
                                minHeight: 200,
                            }}
                        >
                            {/* Column Header */}
                            <div style={{
                                padding: '14px 16px 12px',
                                borderBottom: '1px solid var(--zazmic-gray-300)',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--zazmic-black)' }}>{stage.label}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, color: stage.color,
                                        background: stage.bg, border: `1px solid ${stage.color}33`,
                                        borderRadius: 99, padding: '1px 7px',
                                    }}>
                                        {stage.deals.length}
                                    </span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zazmic-gray-500)' }}>
                                    {formatCurrency(stage.total)}
                                </span>
                            </div>

                            {/* Cards */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 12px' }}>
                                {stage.deals.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--zazmic-gray-500)' }}>
                                        No deals
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {stage.deals.map((deal) => (
                                            <DealCard
                                                key={deal.id}
                                                deal={deal}
                                                stage={stage}
                                                allStages={PIPELINE_STAGES}
                                                formatCurrency={formatCurrency}
                                                onEdit={() => setEditingDeal(deal)}
                                                onDelete={() => handleDelete(deal.id)}
                                                onMove={(s) => handleStageChange(deal, s)}
                                                onClick={() => navigate(`/deals/${deal.id}`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DealCard({ deal, stage, allStages, formatCurrency, onEdit, onDelete, onMove, onClick }) {
    const [showMoveMenu, setShowMoveMenu] = useState(false);

    const daysUntilClose = deal.close_date
        ? Math.ceil((new Date(deal.close_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const closeColor = daysUntilClose === null ? null
        : daysUntilClose < 0 ? '#E63946'
        : daysUntilClose <= 7 ? '#F59E0B'
        : '#6B7280';

    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                border: '1px solid var(--zazmic-gray-300)',
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'var(--zazmic-gray-500)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--zazmic-gray-300)';
                setShowMoveMenu(false);
            }}
        >
            {/* Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--zazmic-black)', lineHeight: 1.35, flex: 1, paddingRight: 8 }}>
                    {deal.title}
                </p>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                        title="Edit"
                        onClick={onEdit}
                        style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--zazmic-gray-500)', borderRadius: 4, display: 'grid', placeItems: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--zazmic-red)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--zazmic-gray-500)'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                    </button>
                    <button
                        title="Delete"
                        onClick={onDelete}
                        style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--zazmic-gray-500)', borderRadius: 4, display: 'grid', placeItems: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#E63946'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--zazmic-gray-500)'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                    </button>
                </div>
            </div>

            {/* Value */}
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--zazmic-black)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                {formatCurrency(deal.value)}
            </p>

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--zazmic-gray-500)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                    {deal.contact_name || deal.account_name || '—'}
                </span>
                {daysUntilClose !== null && (
                    <span style={{ color: closeColor, fontWeight: 500, fontSize: 11, whiteSpace: 'nowrap' }}>
                        {daysUntilClose < 0 ? `${Math.abs(daysUntilClose)}d overdue` : daysUntilClose === 0 ? 'Due today' : `${daysUntilClose}d left`}
                    </span>
                )}
                {deal.effective_probability != null && (
                    <span style={{ color: stage.color, fontWeight: 600, fontSize: 11 }}>{deal.effective_probability}%</span>
                )}
            </div>

            {/* Loss reason */}
            {deal.stage === 'closed_lost' && deal.loss_reason && (
                <p style={{ fontSize: 11, color: '#E63946', marginTop: 6, borderTop: '1px solid #fee2e2', paddingTop: 6 }}>
                    {deal.loss_reason}
                </p>
            )}

            {/* Move to stage */}
            <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 10, borderTop: '1px solid var(--zazmic-gray-100)', paddingTop: 8 }}>
                <button
                    onClick={() => setShowMoveMenu((v) => !v)}
                    style={{ fontSize: 11, color: 'var(--zazmic-gray-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                    Move to &nbsp;
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {showMoveMenu && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {allStages.filter((s) => s.key !== stage.key).map((s) => (
                            <button
                                key={s.key}
                                onClick={() => { onMove(s.key); setShowMoveMenu(false); }}
                                style={{
                                    fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                                    border: `1px solid ${s.color}44`, background: s.bg, color: s.color, fontWeight: 500,
                                    transition: 'opacity 0.15s',
                                }}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
