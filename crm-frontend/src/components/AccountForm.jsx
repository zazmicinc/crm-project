import { useState } from 'react';

export default function AccountForm({ account, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: account?.name || '',
        industry: account?.industry || '',
        website: account?.website || '',
        phone: account?.phone || '',
        email: account?.email || '',
        address: account?.address || '',
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
                {account ? 'Edit Account' : 'New Account'}
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Name *</label>
                        <input
                            className="input-field"
                            placeholder="Acme Corp"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Industry</label>
                        <input
                            className="input-field"
                            placeholder="Technology"
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Website</label>
                        <input
                            className="input-field"
                            placeholder="https://acme.com"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
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
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="contact@acme.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Address</label>
                    <textarea
                        className="input-field min-h-[80px] resize-y"
                        placeholder="123 Main St, Anytown"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary">{account ? 'Update' : 'Create'} Account</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
