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
        <div className="animate-fade-in pb-12 w-full max-w-4xl mx-auto">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-[40px] font-bold text-zazmic-black tracking-tight mb-2">User Management</h1>
                    <p className="text-[17px] text-zazmic-gray-500">Manage system access and permissions</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New User
                </button>
            </header>

            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-black/[0.04]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">User</th>
                                <th className="px-6 py-4 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Email</th>
                                <th className="px-6 py-4 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Role</th>
                                <th className="px-6 py-4 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Status</th>
                                <th className="px-6 py-4 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-zazmic-gray-100 transition-colors border-b border-zazmic-gray-100 last:border-0 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-zazmic-black flex items-center justify-center text-[14px] font-semibold uppercase">
                                                {u.first_name[0]}{u.last_name[0]}
                                            </div>
                                            <span className="font-medium text-[15px] text-zazmic-black">{u.first_name} {u.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[15px] text-zazmic-gray-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${u.role?.name === 'Admin' ? 'bg-[#F3E8FC] text-[#A855F7]' :
                                                u.role?.name === 'Sales Rep' ? 'bg-[#E8F2FC] text-[#E63946]' :
                                                    'bg-[#F3F4F6] text-[#6B7280]'
                                            }`}>
                                            {u.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_active ?
                                            <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#30D158]">
                                                <span className="w-2 h-2 rounded-full bg-[#30D158]"></span>
                                                Active
                                            </span> :
                                            <span className="flex items-center gap-1.5 text-[14px] font-medium text-zazmic-gray-500">
                                                <span className="w-2 h-2 rounded-full bg-zazmic-gray-500"></span>
                                                Inactive
                                            </span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F3F4F6] text-zazmic-gray-500 hover:bg-zazmic-red hover:text-white transition-colors"
                                                onClick={() => { setEditingUser(u); setShowForm(true); }}
                                                title="Edit"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                            </button>
                                            <button
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F3F4F6] text-zazmic-gray-500 hover:bg-danger hover:text-white transition-colors"
                                                onClick={() => handleDelete(u.id)}
                                                title="Delete"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-16 flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-zazmic-red border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-zazmic-gray-500 text-[15px]">Loading system users...</span>
                    </div>
                )}
                {!loading && users.length === 0 && (
                    <div className="p-16 text-center text-zazmic-gray-500 text-[15px]">
                        No users found in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
