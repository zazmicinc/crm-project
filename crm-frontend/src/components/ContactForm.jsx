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
        <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {contact ? 'Edit Contact' : 'New Contact'}
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
                            placeholder="Jane Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email *</label>
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
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Notes</label>
                    <textarea
                        className="input-field min-h-[80px] resize-y"
                        placeholder="Key decision maker, met at conference..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary">{contact ? 'Update' : 'Create'} Contact</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
