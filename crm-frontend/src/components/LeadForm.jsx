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
        lead_score: lead?.lead_score ?? 0,
        job_title: lead?.job_title || '',
        industry: lead?.industry || '',
        company_size: lead?.company_size || '',
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
        <div className="bg-white rounded-[24px] shadow-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-zazmic-black tracking-tight">
                {lead ? 'Edit Lead' : 'New Lead'}
            </h2>

            {error && (
                <div className="mb-6 p-4 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[15px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">First Name *</label>
                        <input
                            className="input-field"
                            placeholder="John"
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Last Name *</label>
                        <input
                            className="input-field"
                            placeholder="Doe"
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Email *</label>
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
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Phone</label>
                        <input
                            className="input-field"
                            placeholder="+1-555-0100"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Company</label>
                        <input
                            className="input-field"
                            placeholder="Acme Corp"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Source</label>
                        <input
                            className="input-field"
                            placeholder="Website, Referral..."
                            value={form.source}
                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Status</label>
                        <select
                            className="input-field"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Dead">Dead</option>
                            <option value="Converted">Converted</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Job Title</label>
                        <input
                            className="input-field"
                            placeholder="VP of Sales"
                            value={form.job_title}
                            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Industry</label>
                        <input
                            className="input-field"
                            placeholder="Technology"
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Company Size</label>
                        <select
                            className="input-field"
                            value={form.company_size}
                            onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                        >
                            <option value="">—</option>
                            <option value="1-10">1–10</option>
                            <option value="11-50">11–50</option>
                            <option value="51-200">51–200</option>
                            <option value="201-500">201–500</option>
                            <option value="500+">500+</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">
                            Lead Score
                            {form.lead_score >= 70 ? <span style={{ marginLeft: 8, color: '#e8192c', fontSize: 12, fontWeight: 600 }}>HOT</span>
                                : form.lead_score >= 40 ? <span style={{ marginLeft: 8, color: '#b45309', fontSize: 12, fontWeight: 600 }}>WARM</span>
                                : <span style={{ marginLeft: 8, color: '#6b7280', fontSize: 12, fontWeight: 600 }}>COLD</span>}
                        </label>
                        <input
                            className="input-field"
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={form.lead_score}
                            onChange={(e) => setForm({ ...form, lead_score: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-zazmic-gray-100">
                    <button type="submit" className="btn-primary">{lead ? 'Update' : 'Create'} Lead</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
