import { useState, useEffect } from 'react';
import { notesApi, contactsApi, dealsApi } from '../api';

function NoteComposer({ relatedToType, relatedToId, onNoteCreated }) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            await notesApi.create({
                content,
                related_to_type: relatedToType,
                related_to_id: parseInt(relatedToId)
            });
            setContent('');
            if (onNoteCreated) onNoteCreated();
        } catch (err) {
            console.error(err);
            alert('Failed to create note');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
            <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows="3"
                placeholder="Write a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end mt-2">
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="btn-primary px-4 py-1.5 text-sm"
                >
                    {submitting ? 'Saving...' : 'Add Note'}
                </button>
            </div>
        </form>
    );
}

function TimelineEvent({ event, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    const handleDelete = async () => {
        if (!confirm('Delete this note?')) return;
        try {
            await notesApi.delete(event.id);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            alert('Failed to delete note');
        }
    };

    const handleUpdate = async () => {
        try {
            await notesApi.update(event.id, { content: editContent });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            alert('Failed to update note');
        }
    };

    const startEdit = () => {
        setEditContent(event.data.content);
        setIsEditing(true);
    };

    if (event.type === 'note') {
        return (
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs">
                        📝
                    </div>
                    <div className="w-px h-full bg-slate-800 my-2"></div>
                </div>
                <div className="flex-1 pb-6">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-slate-500">
                                {new Date(event.timestamp).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={startEdit} className="text-xs text-slate-400 hover:text-white">Edit</button>
                                <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-red-400">Delete</button>
                            </div>
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400">Cancel</button>
                                    <button onClick={handleUpdate} className="text-xs text-indigo-400">Save</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-300 whitespace-pre-wrap">{event.data.content}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (event.type === 'activity') {
        return (
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs">
                        📅
                    </div>
                    <div className="w-px h-full bg-slate-800 my-2"></div>
                </div>
                <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-200">{event.data.subject}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 uppercase tracking-wider">
                            {event.data.type}
                        </span>
                    </div>
                    <div className="text-sm text-slate-400 mb-2">
                        Due: {new Date(event.data.date).toLocaleString()}
                    </div>
                    {event.data.description && (
                        <p className="text-sm text-slate-500">{event.data.description}</p>
                    )}
                </div>
            </div>
        );
    }

    if (event.type === 'stage_change') {
        const fromName = event.data.from_stage_name || `Stage #${event.data.from_stage_id || 'Start'}`;
        const toName = event.data.to_stage_name || `Stage #${event.data.to_stage_id}`;

        return (
            <div className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xs">
                        🚀
                    </div>
                    <div className="w-px h-full bg-slate-800 my-2"></div>
                </div>
                <div className="flex-1 pb-6 py-1">
                    <div className="text-sm text-slate-300">
                        Deal moved from <span className="font-medium text-purple-300">{fromName}</span> to <span className="font-medium text-purple-300">{toName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default function Timeline({ relatedToType, relatedToId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeline = async () => {
        try {
            let data = [];
            if (relatedToType === 'contact') {
                data = await contactsApi.getTimeline(relatedToId);
            } else if (relatedToType === 'deal') {
                data = await dealsApi.getTimeline(relatedToId);
            }
            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch timeline', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (relatedToId) {
            fetchTimeline();
        }
    }, [relatedToType, relatedToId]);

    if (loading) return <div className="text-center py-10 text-slate-500">Loading timeline...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <NoteComposer relatedToType={relatedToType} relatedToId={relatedToId} onNoteCreated={fetchTimeline} />
            
            <div className="space-y-2">
                {events.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No activity yet.</div>
                ) : (
                    events.map(event => (
                        <TimelineEvent key={`${event.type}-${event.id}`} event={event} onUpdate={fetchTimeline} />
                    ))
                )}
            </div>
        </div>
    );
}
