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
        <div className="bg-white rounded-[24px] shadow-apple-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-apple-text tracking-tight">
                {account ? 'Edit Account' : 'New Account'}
            </h2>

            {error && (
                <div className="mb-6 p-4 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[15px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Name *</label>
                        <input
                            className="input-field"
                            placeholder="Acme Corp"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Industry</label>
                        <input
                            className="input-field"
                            placeholder="Technology"
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Website</label>
                        <input
                            className="input-field"
                            placeholder="https://acme.com"
                            value={form.website}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Phone</label>
                        <input
                            className="input-field"
                            placeholder="+1-555-0100"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-apple-text mb-2">Email</label>
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
                    <label className="block text-[14px] font-medium text-apple-text mb-2">Address</label>
                    <textarea
                        className="input-field min-h-[100px] resize-y"
                        placeholder="123 Main St, Anytown"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-apple-bg">
                    <button type="submit" className="btn-primary">{account ? 'Update' : 'Create'} Account</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
