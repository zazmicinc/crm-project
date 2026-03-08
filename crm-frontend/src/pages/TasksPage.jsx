import { useState, useEffect, useCallback } from 'react';
import { activitiesApi, usersApi } from '../api';
import TaskForm from '../components/TaskForm';
import { ListTable } from '../components/shared/ListTable';
import { formatDate } from '../utils/formatDate';

function TaskStatusBadge({ task }) {
    const now = new Date();
    if (task.completed_at) {
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fff4', color: '#1a7f4b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27ae60', flexShrink: 0 }} />
                Complete
            </span>
        );
    }
    if (task.due_date && new Date(task.due_date) < now) {
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff0f0', color: '#e8192c', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8192c', flexShrink: 0 }} />
                Overdue
            </span>
        );
    }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f9fafb', color: '#6b7280', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', flexShrink: 0 }} />
            Pending
        </span>
    );
}

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (ownerFilter) params.assigned_to_id = ownerFilter;
            if (statusFilter === 'complete') params.completed = 'true';
            else if (statusFilter === 'pending' || statusFilter === 'overdue') params.completed = 'false';
            const data = await activitiesApi.tasks(params);
            let filtered = data;
            if (statusFilter === 'overdue') {
                const now = new Date();
                filtered = data.filter(t => t.due_date && new Date(t.due_date) < now);
            } else if (statusFilter === 'pending') {
                const now = new Date();
                filtered = data.filter(t => !t.due_date || new Date(t.due_date) >= now);
            }
            setTasks(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [ownerFilter, statusFilter]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);
    useEffect(() => { usersApi.list().then(setUsers).catch(() => {}); }, []);

    const handleCreate = async (data) => {
        await activitiesApi.create(data);
        setShowForm(false);
        fetchTasks();
    };

    const handleUpdate = async (data) => {
        await activitiesApi.update(editingTask.id, data);
        setEditingTask(null);
        fetchTasks();
    };

    const handleComplete = async (task) => {
        await activitiesApi.complete(task.id);
        fetchTasks();
    };

    const handleReopen = async (task) => {
        await activitiesApi.reopen(task.id);
        fetchTasks();
    };

    const handleDelete = async (task) => {
        if (!confirm('Delete this task?')) return;
        await activitiesApi.delete(task.id);
        fetchTasks();
    };

    if (showForm) {
        return <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }
    if (editingTask) {
        return <TaskForm task={editingTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />;
    }

    const columns = [
        {
            key: 'subject', label: 'Task', width: '1fr',
            render: (t) => (
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em', textDecoration: t.completed_at ? 'line-through' : 'none', opacity: t.completed_at ? 0.5 : 1 }}>
                    {t.subject}
                </span>
            )
        },
        {
            key: 'status', label: 'Status', width: '120px',
            render: (t) => <TaskStatusBadge task={t} />
        },
        {
            key: 'due_date', label: 'Due Date', width: '140px',
            render: (t) => {
                if (!t.due_date) return <span style={{ fontSize: 13, color: '#aaa' }}>—</span>;
                const overdue = !t.completed_at && new Date(t.due_date) < new Date();
                return <span style={{ fontSize: 13, color: overdue ? '#e8192c' : '#888', fontWeight: overdue ? 600 : 400 }}>{formatDate(t.due_date)}</span>;
            }
        },
        {
            key: 'assigned', label: 'Assigned To', width: '160px',
            render: (t) => <span style={{ fontSize: 13, color: '#666' }}>{t.assigned_to_name || '—'}</span>
        },
        {
            key: 'actions', label: '', width: '160px',
            render: (t) => (
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    {t.completed_at ? (
                        <button
                            onClick={() => handleReopen(t)}
                            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #e8e8e8', background: '#fafafa', color: '#666', cursor: 'pointer', fontWeight: 500 }}
                        >
                            Reopen
                        </button>
                    ) : (
                        <button
                            onClick={() => handleComplete(t)}
                            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #27ae6033', background: '#f0fff4', color: '#1a7f4b', cursor: 'pointer', fontWeight: 600 }}
                        >
                            ✓ Done
                        </button>
                    )}
                    <button
                        onClick={() => setEditingTask(t)}
                        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #e8e8e8', background: '#fafafa', color: '#666', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(t)}
                        style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #e8192c22', background: '#fff0f0', color: '#e8192c', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Delete
                    </button>
                </div>
            )
        },
    ];

    const paginatedTasks = tasks.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(tasks.length / pageSize);

    const headerExtra = (
        <>
            <div style={{ display: 'flex', gap: 4, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, padding: 4 }}>
                {[
                    { key: '', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'overdue', label: 'Overdue' },
                    { key: 'complete', label: 'Complete' },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => { setStatusFilter(s.key); setPage(1); }}
                        style={{
                            padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12,
                            fontWeight: 500, cursor: 'pointer',
                            background: statusFilter === s.key ? '#fff' : 'transparent',
                            color: statusFilter === s.key ? '#0a0a0a' : '#999',
                            boxShadow: statusFilter === s.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
            {users.length > 0 && (
                <select
                    style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, padding: '6px 12px', fontSize: 13, outline: 'none', color: ownerFilter ? '#0a0a0a' : '#999' }}
                    value={ownerFilter}
                    onChange={(e) => { setOwnerFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All owners</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                    ))}
                </select>
            )}
        </>
    );

    return (
        <div className="animate-fade-in pb-12">
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                    <div style={{ width: 28, height: 28, border: '2px solid #e8192c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <p style={{ fontSize: 14, color: '#aaa' }}>Loading tasks...</p>
                </div>
            ) : (
                <ListTable
                    title="Tasks"
                    breadcrumb="CRM / Tasks"
                    columns={columns}
                    rows={paginatedTasks}
                    newButtonLabel="+ New Task"
                    onNew={() => setShowForm(true)}
                    onRowClick={() => {}}
                    totalCount={tasks.length}
                    currentPage={page}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    headerExtra={headerExtra}
                />
            )}
        </div>
    );
}
