import { useState, useEffect } from 'react';
import { contactsApi } from '../api';

const STAGES = [
    { value: 'prospecting', label: 'Lead' },
    { value: 'qualification', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Won' },
    { value: 'closed_lost', label: 'Lost' },
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
        <div className="bg-white rounded-[24px] shadow-apple-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-apple-text tracking-tight">
                {deal ? 'Edit Deal' : 'New Deal'}
            </h2>

            {error && (
                <div className="mb-6 p-4 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[15px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Title *</label>
                        <input
                            className="input-field"
                            placeholder="Enterprise Plan"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Value ($) *</label>
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
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Stage *</label>
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
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Contact *</label>
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
                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-apple-bg">
                    <button type="submit" className="btn-primary">{deal ? 'Update' : 'Create'} Deal</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
