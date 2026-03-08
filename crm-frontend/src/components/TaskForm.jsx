import { useState, useEffect } from 'react';
import { usersApi } from '../api';

export default function TaskForm({ task, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        type: 'task',
        is_task: true,
        subject: task?.subject || '',
        description: task?.description || '',
        outcome: task?.outcome || '',
        due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
        assigned_to_id: task?.assigned_to_id || '',
        contact_id: task?.contact_id || '',
        deal_id: task?.deal_id || '',
        lead_id: task?.lead_id || '',
        account_id: task?.account_id || '',
    });
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        usersApi.list().then(setUsers).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            ...form,
            assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
            contact_id: form.contact_id ? Number(form.contact_id) : null,
            deal_id: form.deal_id ? Number(form.deal_id) : null,
            lead_id: form.lead_id ? Number(form.lead_id) : null,
            account_id: form.account_id ? Number(form.account_id) : null,
            due_date: form.due_date || null,
        };
        try {
            await onSubmit(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-white rounded-[24px] shadow-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-zazmic-black tracking-tight">
                {task ? 'Edit Task' : 'New Task'}
            </h2>

            {error && (
                <div className="mb-6 p-4 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[15px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Subject *</label>
                        <input
                            className="input-field"
                            placeholder="Follow up with client"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Due Date *</label>
                        <input
                            className="input-field"
                            type="datetime-local"
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Assigned To</label>
                        <select
                            className="input-field"
                            value={form.assigned_to_id}
                            onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value })}
                        >
                            <option value="">— Unassigned —</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Description</label>
                        <textarea
                            className="input-field min-h-[80px] resize-y"
                            placeholder="Task details..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Outcome / Result</label>
                        <textarea
                            className="input-field min-h-[80px] resize-y"
                            placeholder="What was accomplished..."
                            value={form.outcome}
                            onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-zazmic-gray-100">
                    <button type="submit" className="btn-primary">{task ? 'Update' : 'Create'} Task</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
