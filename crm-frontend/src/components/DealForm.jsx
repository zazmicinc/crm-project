import { useState, useEffect } from 'react';
import { contactsApi } from '../api';

const STAGES = [
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
];

export default function DealForm({ deal, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        title: '',
        value: '',
        stage: 'prospecting',
        contact_id: '',
    });
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        contactsApi.list().then(setContacts).catch(() => { });
    }, []);

    useEffect(() => {
        if (deal) {
            setForm({
                title: deal.title || '',
                value: deal.value ?? '',
                stage: deal.stage || 'prospecting',
                contact_id: deal.contact_id ?? '',
            });
        }
    }, [deal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form, value: parseFloat(form.value), contact_id: parseInt(form.contact_id) };
            await onSubmit(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {deal ? 'Edit Deal' : 'New Deal'}
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Title *</label>
                        <input
                            className="input-field"
                            placeholder="Enterprise Plan"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Value ($) *</label>
                        <input
                            className="input-field"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="15000"
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Stage *</label>
                        <select
                            className="input-field"
                            value={form.stage}
                            onChange={(e) => setForm({ ...form, stage: e.target.value })}
                        >
                            {STAGES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Contact *</label>
                        <select
                            className="input-field"
                            value={form.contact_id}
                            onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                            required
                        >
                            <option value="">Select a contact</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} — {c.company || c.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary">{deal ? 'Update' : 'Create'} Deal</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
