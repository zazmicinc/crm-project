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

    if (loading) return <div className="text-center py-20 text-slate-400">Loading pipeline…</div>;
    if (!pipeline) return (
        <div className="text-center py-20 text-slate-400">
            <p className="mb-4">No pipeline configured.</p>
            <Link to="/settings/pipelines" className="btn-primary inline-block">
                Create Pipeline
            </Link>
        </div>
    );

    return (
        <div className="animate-fade-in h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 px-1">
                <h1 className="text-2xl font-bold">{pipeline.name}</h1>
                <Link to="/settings/pipelines" className="text-sm text-slate-400 hover:text-white transition-colors">
                    ⚙️ Configure Pipeline
                </Link>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full gap-4 min-w-max">
                        {stages.map(stage => (
                            <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col glass-card bg-slate-900/40 border-slate-800/50">
                                {/* Column Header */}
                                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-white/5">
                                    <h3 className="font-semibold text-slate-200">{stage.name}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                        {getDealsByStage(stage.id).length}
                                    </span>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={String(stage.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
                                            }`}
                                        >
                                            {getDealsByStage(stage.id).map((deal, index) => (
                                                <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                            className={`p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all shadow-sm group ${
                                                                snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : ''
                                                            }`}
                                                        >
                                                            <Link to={`/deals/${deal.id}`} className="block group-hover:text-indigo-300 transition-colors font-medium mb-2">
                                                                {deal.title}
                                                            </Link>
                                                            <div className="flex justify-between items-end text-sm">
                                                                <div className="text-emerald-400 font-mono">
                                                                    ${deal.value?.toLocaleString()}
                                                                </div>
                                                                <div className="text-slate-500 text-xs">
                                                                    {deal.contact_name || `ID #${deal.contact_id}`}
                                                                </div>
                                                            </div>
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
