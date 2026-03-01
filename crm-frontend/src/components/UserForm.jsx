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
        <div className="bg-white rounded-[24px] shadow-lg border border-black/[0.04] p-8 animate-slide-up max-w-2xl mx-auto my-8">
            <h2 className="text-[24px] font-semibold mb-8 text-zazmic-black tracking-tight">
                {user ? 'Edit User' : 'New User'}
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
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Last Name *</label>
                        <input
                            className="input-field"
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
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">Role *</label>
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
                        <label className="block text-[14px] font-medium text-zazmic-black mb-2">
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
                    <div className="flex items-center gap-3 pt-[38px]">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            className="w-4 h-4 rounded text-zazmic-red focus:ring-zazmic-red border-[#D1D5DB]"
                        />
                        <label htmlFor="is_active" className="text-[14px] font-medium text-zazmic-black cursor-pointer">Active User</label>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-6 mt-8 border-t border-zazmic-gray-100">
                    <button type="submit" className="btn-primary">
                        {user ? 'Update' : 'Create'} User
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
