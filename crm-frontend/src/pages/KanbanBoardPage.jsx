import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { pipelinesApi, dealsApi } from '../api';

export default function KanbanBoardPage() {
    const [pipeline, setPipeline] = useState(null);
    const [stages, setStages] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch pipelines to find default
            const pipes = await pipelinesApi.list();
            if (pipes.length === 0) {
                setLoading(false);
                return; // Handle no pipeline state if needed
            }
            const defaultPipeline = pipes.find(p => p.is_default) || pipes[0];
            setPipeline(defaultPipeline);

            // Fetch stages and deals
            const [stagesData, dealsData] = await Promise.all([
                pipelinesApi.listStages(defaultPipeline.id),
                dealsApi.list()
            ]);
            setStages(stagesData);
            setDeals(dealsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDealsByStage = (stageId) => {
        return deals.filter(d => d.stage_id === stageId);
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const dealId = parseInt(draggableId);
        const newStageId = parseInt(destination.droppableId);

        // Optimistic UI update
        const updatedDeals = deals.map(d => 
            d.id === dealId ? { ...d, stage_id: newStageId } : d
        );
        setDeals(updatedDeals);

        try {
            await dealsApi.move(dealId, newStageId);
        } catch (err) {
            console.error('Failed to move deal', err);
            // Revert state on error? For now, we assume success or user refresh.
            alert('Failed to move deal: ' + err.message);
            fetchData(); // Re-fetch to sync
        }
    };

    const STAGE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#E63946', '#10B981', '#6B7280'];
    const STAGE_BG    = ['#EFF6FF', '#F5F3FF', '#FFFBEB', '#FFF0F1', '#ECFDF5', '#F9FAFB'];

    const stageColor = (i) => STAGE_COLORS[i % STAGE_COLORS.length];
    const stageBg    = (i) => STAGE_BG[i % STAGE_BG.length];

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v ?? 0);

    const stageTotal = (stageId) =>
        getDealsByStage(stageId).reduce((s, d) => s + (d.value ?? 0), 0);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--zazmic-gray-500)', fontSize: 14 }}>
            Loading pipeline…
        </div>
    );

    if (!pipeline) return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ marginBottom: 16, color: 'var(--zazmic-gray-500)', fontSize: 14 }}>No pipeline configured.</p>
            <Link to="/settings/pipelines" className="btn-primary">Create Pipeline</Link>
        </div>
    );

    return (
        <div style={{ fontFamily: 'var(--font-primary)', color: 'var(--zazmic-black)', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
                        {pipeline.name}
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--zazmic-gray-500)' }}>
                        <strong style={{ color: 'var(--zazmic-black)' }}>{deals.length}</strong> deals &nbsp;·&nbsp;
                        <strong style={{ color: 'var(--zazmic-black)' }}>
                            {formatCurrency(deals.reduce((s, d) => s + (d.value ?? 0), 0))}
                        </strong> total pipeline value
                    </p>
                </div>
                <Link
                    to="/settings/pipelines"
                    style={{ fontSize: 13, color: 'var(--zazmic-gray-500)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--zazmic-red)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--zazmic-gray-500)'}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Configure Pipeline
                </Link>
            </div>

            {/* Kanban Board */}
            <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'flex-start' }}>
                        {stages.map((stage, i) => (
                            <div
                                key={stage.id}
                                style={{
                                    width: 272,
                                    minWidth: 272,
                                    flexShrink: 0,
                                    background: stageBg(i),
                                    border: '1px solid var(--zazmic-gray-300)',
                                    borderRadius: 12,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: 'calc(100vh - 260px)',
                                    minHeight: 160,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Column Header */}
                                <div style={{
                                    padding: '13px 16px 11px',
                                    borderBottom: '1px solid var(--zazmic-gray-300)',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stageColor(i), flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--zazmic-black)' }}>{stage.name}</span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, color: stageColor(i),
                                            background: stageBg(i), border: `1px solid ${stageColor(i)}33`,
                                            borderRadius: 99, padding: '1px 7px',
                                        }}>
                                            {getDealsByStage(stage.id).length}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zazmic-gray-500)' }}>
                                        {formatCurrency(stageTotal(stage.id))}
                                    </span>
                                </div>

                                {/* Droppable */}
                                <Droppable droppableId={String(stage.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={{
                                                flex: 1,
                                                overflowY: 'auto',
                                                padding: '10px 10px 12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 8,
                                                background: snapshot.isDraggingOver ? `${stageColor(i)}0D` : 'transparent',
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            {getDealsByStage(stage.id).length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--zazmic-gray-500)' }}>
                                                    No deals
                                                </div>
                                            )}
                                            {getDealsByStage(stage.id).map((deal, index) => (
                                                <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                background: 'white',
                                                                border: snapshot.isDragging
                                                                    ? `1px solid ${stageColor(i)}`
                                                                    : '1px solid var(--zazmic-gray-300)',
                                                                borderRadius: 8,
                                                                padding: '12px 14px',
                                                                boxShadow: snapshot.isDragging
                                                                    ? `0 8px 24px rgba(0,0,0,0.12)`
                                                                    : 'none',
                                                                transform: snapshot.isDragging
                                                                    ? `${provided.draggableProps.style?.transform} rotate(1.5deg)`
                                                                    : provided.draggableProps.style?.transform,
                                                                cursor: 'grab',
                                                            }}
                                                        >
                                                            <Link
                                                                to={`/deals/${deal.id}`}
                                                                style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--zazmic-black)', textDecoration: 'none', marginBottom: 8, lineHeight: 1.35 }}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--zazmic-red)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--zazmic-black)'}
                                                            >
                                                                {deal.title}
                                                            </Link>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--zazmic-black)', letterSpacing: '-0.02em' }}>
                                                                    {formatCurrency(deal.value)}
                                                                </span>
                                                                <span style={{ fontSize: 12, color: 'var(--zazmic-gray-500)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {deal.contact_name || `#${deal.contact_id}`}
                                                                </span>
                                                            </div>
                                                            {deal.close_date && (() => {
                                                                const days = Math.ceil((new Date(deal.close_date) - new Date()) / 86400000);
                                                                const color = days < 0 ? '#E63946' : days <= 7 ? '#F59E0B' : 'var(--zazmic-gray-500)';
                                                                return (
                                                                    <p style={{ fontSize: 11, color, marginTop: 6, fontWeight: 500 }}>
                                                                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                                                                    </p>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
