import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { pipelinesApi } from '../api';

export default function PipelineSettingsPage() {
    const [pipelines, setPipelines] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPipelineName, setNewPipelineName] = useState('');
    const [newStageName, setNewStageName] = useState('');

    const fetchPipelines = useCallback(async () => {
        try {
            const data = await pipelinesApi.list();
            setPipelines(data);
            if (data.length > 0 && !selectedPipeline) {
                // Select default or first
                const def = data.find(p => p.is_default) || data[0];
                setSelectedPipeline(def);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedPipeline]);

    const fetchStages = useCallback(async (pipelineId) => {
        try {
            const data = await pipelinesApi.listStages(pipelineId);
            setStages(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchPipelines();
    }, [fetchPipelines]);

    useEffect(() => {
        if (selectedPipeline) {
            fetchStages(selectedPipeline.id);
        } else {
            setStages([]);
        }
    }, [selectedPipeline, fetchStages]);

    const handleCreatePipeline = async (e) => {
        e.preventDefault();
        if (!newPipelineName.trim()) return;
        try {
            const newItem = await pipelinesApi.create({ name: newPipelineName, is_default: pipelines.length === 0 });
            setPipelines([...pipelines, newItem]);
            setSelectedPipeline(newItem);
            setNewPipelineName('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCreateStage = async (e) => {
        e.preventDefault();
        if (!newStageName.trim() || !selectedPipeline) return;
        try {
            const newItem = await pipelinesApi.createStage(selectedPipeline.id, {
                name: newStageName,
                order: stages.length,
                probability: 50 // Default
            });
            setStages([...stages, newItem]);
            setNewStageName('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteStage = async (stageId) => {
        if (!confirm('Delete this stage?')) return;
        try {
            await pipelinesApi.deleteStage(selectedPipeline.id, stageId);
            setStages(stages.filter(s => s.id !== stageId));
        } catch (err) {
            alert(err.message);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(stages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setStages(items);

        // Call API to reorder
        try {
            const stageIds = items.map(s => s.id);
            await pipelinesApi.reorderStages(selectedPipeline.id, stageIds);
        } catch (err) {
            console.error('Failed to save order', err);
            // Optionally revert state on error
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400">Loading settings…</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pipeline Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar: Pipeline List */}
                <div className="md:col-span-1 space-y-4">
                    <div className="glass-card p-4">
                        <h3 className="font-semibold text-slate-300 mb-3">Pipelines</h3>
                        <div className="space-y-2 mb-4">
                            {pipelines.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPipeline(p)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        selectedPipeline?.id === p.id
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                            : 'text-slate-400 hover:bg-white/5'
                                    }`}
                                >
                                    {p.name} {p.is_default && '★'}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handleCreatePipeline}>
                            <input
                                className="input-field text-sm"
                                placeholder="+ New Pipeline"
                                value={newPipelineName}
                                onChange={e => setNewPipelineName(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                {/* Main: Stages Config */}
                <div className="md:col-span-3">
                    {selectedPipeline ? (
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-4">{selectedPipeline.name} Stages</h2>
                            <p className="text-sm text-slate-400 mb-6">
                                Drag and drop stages to reorder the pipeline steps.
                            </p>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="stages">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2"
                                        >
                                            {stages.map((stage, index) => (
                                                <Draggable key={stage.id} draggableId={String(stage.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`p-3 rounded border flex items-center justify-between ${
                                                                snapshot.isDragging
                                                                    ? 'bg-indigo-900/80 border-indigo-500 shadow-lg'
                                                                    : 'bg-white/5 border-slate-700 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-500 text-lg">≡</span>
                                                                <span className="text-white">{stage.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteStage(stage.id)}
                                                                className="text-slate-500 hover:text-red-400"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            <form onSubmit={handleCreateStage} className="mt-6 flex gap-2">
                                <input
                                    className="input-field"
                                    placeholder="New Stage Name"
                                    value={newStageName}
                                    onChange={e => setNewStageName(e.target.value)}
                                />
                                <button type="submit" className="btn-primary whitespace-nowrap">
                                    Add Stage
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            Select or create a pipeline to configure stages.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
