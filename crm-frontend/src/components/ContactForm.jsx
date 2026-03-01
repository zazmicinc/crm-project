import { useState, useEffect } from 'react';

export default function ContactForm({ contact, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (contact) {
            setForm({
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                company: contact.company || '',
                notes: contact.notes || '',
            });
        }
    }, [contact]);

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
                {contact ? 'Edit Contact' : 'New Contact'}
            </h2>

            {error && (
                <div className="mb-6 p-4 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[15px] font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Name *</label>
                        <input
                            className="input-field"
                            placeholder="Jane Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Email *</label>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="jane@example.com"
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
                </div>
                <div>
                    <label className="block text-[14px] font-medium text-zazmic-black mb-2">Notes</label>
                    <textarea
                        className="input-field min-h-[100px] resize-y"
                        placeholder="Key decision maker, met at conference..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-zazmic-gray-100">
                    <button type="submit" className="btn-primary">{contact ? 'Update' : 'Create'} Contact</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
