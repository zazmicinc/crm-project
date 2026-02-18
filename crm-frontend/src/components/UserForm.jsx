import { useState, useEffect } from 'react';
import { rolesApi } from '../api';

export default function UserForm({ user, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role_id: '',
        is_active: true
    });
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        rolesApi.list().then(setRoles).catch(console.error);
    }, []);

    useEffect(() => {
        if (user) {
            setForm({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                password: '', // Don't prepopulate password hash
                role_id: user.role_id || '',
                is_active: user.is_active ?? true
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form, role_id: parseInt(form.role_id) };
            if (!user && !payload.password) {
                throw new Error("Password is required for new users");
            }
            if (user && !payload.password) {
                delete payload.password; // Don't update password if empty on edit
            }
            await onSubmit(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-card p-6 animate-slide-up max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user ? 'Edit User' : 'New User'}
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
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Last Name *</label>
                        <input
                            className="input-field"
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
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Role *</label>
                        <select
                            className="input-field"
                            value={form.role_id}
                            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                            required
                        >
                            <option value="">Select Role</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">
                            {user ? 'New Password (leave blank to keep current)' : 'Password *'}
                        </label>
                        <input
                            className="input-field"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required={!user}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-300">Active User</label>
                    </div>
                </div>

                <div className="flex gap-3 pt-6">
                    <button type="submit" className="btn-primary px-8">
                        {user ? 'Update' : 'Create'} User
                    </button>
                    <button type="button" className="btn-secondary px-8" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
