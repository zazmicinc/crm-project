import { useState } from 'react';

export default function LeadForm({ lead, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        first_name: lead?.first_name || '',
        last_name: lead?.last_name || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        status: lead?.status || 'New',
        source: lead?.source || '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSubmit(form);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {lead ? 'Edit Lead' : 'New Lead'}
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                        <input
                            className="input-field"
                            placeholder="John"
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Last Name *</label>
                        <input
                            className="input-field"
                            placeholder="Doe"
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email *</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Phone</label>
                        <input
                            className="input-field"
                            placeholder="+1-555-0100"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Company</label>
                        <input
                            className="input-field"
                            placeholder="Acme Corp"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Source</label>
                        <input
                            className="input-field"
                            placeholder="Website, Referral..."
                            value={form.source}
                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Status</label>
                        <select
                            className="input-field"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Dead">Dead</option>
                            {/* Converted is usually set automatically but can be option if needed, usually hidden in edit */}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary">{lead ? 'Update' : 'Create'} Lead</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
