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

const LOSS_REASONS = ['Price', 'Competitor', 'No Budget', 'No Decision', 'Timing', 'Product Fit', 'Other'];

export default function DealForm({ deal, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        title: '',
        value: '',
        stage: 'prospecting',
        contact_id: '',
        close_date: '',
        probability_override: '',
        loss_reason: '',
        loss_reason_note: '',
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
                close_date: deal.close_date ? deal.close_date.split('T')[0] : '',
                probability_override: deal.probability_override ?? '',
                loss_reason: deal.loss_reason || '',
                loss_reason_note: deal.loss_reason_note || '',
            });
        }
    }, [deal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.stage === 'closed_lost' && !form.loss_reason) {
            setError('Loss reason is required when stage is Closed Lost.');
            return;
        }
        try {
            const payload = {
                ...form,
                value: parseFloat(form.value),
                contact_id: parseInt(form.contact_id),
                close_date: form.close_date ? new Date(form.close_date).toISOString() : null,
                probability_override: form.probability_override !== '' ? parseInt(form.probability_override) : null,
                loss_reason: form.loss_reason || null,
                loss_reason_note: form.loss_reason_note || null,
            };
            await onSubmit(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    const isLost = form.stage === 'closed_lost';

    return (
        <div className="bg-white rounded-[24px] shadow-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-zazmic-black tracking-tight">
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
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Title *</label>
                        <input
                            className="input-field"
                            placeholder="Enterprise Plan"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Value ($) *</label>
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
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Stage *</label>
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
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Contact *</label>
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
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Close Date</label>
                        <input
                            className="input-field"
                            type="date"
                            value={form.close_date}
                            onChange={(e) => setForm({ ...form, close_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Probability Override (%)</label>
                        <input
                            className="input-field"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 75"
                            value={form.probability_override}
                            onChange={(e) => setForm({ ...form, probability_override: e.target.value })}
                        />
                    </div>
                </div>

                {isLost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-[12px] bg-red-50 border border-red-200">
                        <div>
                            <label className="block text-[14px] font-medium text-zazmic-black mb-2">Loss Reason *</label>
                            <select
                                className="input-field"
                                value={form.loss_reason}
                                onChange={(e) => setForm({ ...form, loss_reason: e.target.value })}
                                required={isLost}
                            >
                                <option value="">Select a reason</option>
                                {LOSS_REASONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[14px] font-medium text-zazmic-black mb-2">Loss Note</label>
                            <input
                                className="input-field"
                                placeholder="Optional details..."
                                value={form.loss_reason_note}
                                onChange={(e) => setForm({ ...form, loss_reason_note: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-zazmic-gray-100">
                    <button type="submit" className="btn-primary">{deal ? 'Update' : 'Create'} Deal</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
