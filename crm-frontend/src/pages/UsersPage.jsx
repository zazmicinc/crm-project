import { useState, useEffect } from 'react';
import { usersApi } from '../api';
import UserForm from '../components/UserForm';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await usersApi.list();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (data) => {
        try {
            if (editingUser) {
                await usersApi.update(editingUser.id, data);
            } else {
                await usersApi.create(data);
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersApi.delete(id);
                fetchUsers();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (showForm) {
        return (
            <div className="max-w-4xl mx-auto">
                <UserForm 
                    user={editingUser} 
                    onSubmit={handleSubmit} 
                    onCancel={() => { setShowForm(false); setEditingUser(null); }} 
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                    <p className="text-slate-400 mt-1">Manage system access and permissions</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <span className="text-lg mr-2">+</span> Add User
                </button>
            </header>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 uppercase">
                                                {u.first_name[0]}{u.last_name[0]}
                                            </div>
                                            <span className="font-medium text-slate-200">{u.first_name} {u.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            u.role?.name === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            u.role?.name === 'Sales Rep' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                        }`}>
                                            {u.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_active ? 
                                            <span className="text-green-500 flex items-center gap-1.5 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                                                Active
                                            </span> :
                                            <span className="text-slate-500 flex items-center gap-1.5 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> 
                                                Inactive
                                            </span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button 
                                            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                                            onClick={() => { setEditingUser(u); setShowForm(true); }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="text-slate-500 hover:text-red-400 transition-colors text-sm font-medium"
                                            onClick={() => handleDelete(u.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-12 text-center text-slate-500 animate-pulse">
                        Loading system users...
                    </div>
                )}
                {!loading && users.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No users found in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
