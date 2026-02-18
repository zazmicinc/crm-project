import { useState, useEffect } from 'react';
import { usersApi } from '../api';

export default function AssignOwner({ currentOwnerId, onAssign }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        usersApi.list().then(setUsers).catch(console.error);
    }, []);

    const handleChange = async (e) => {
        const userId = parseInt(e.target.value);
        if (!userId && currentOwnerId === null) return;
        
        setLoading(true);
        try {
            await onAssign(userId || null);
        } catch (err) {
            console.error(err);
            alert("Failed to assign owner: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentOwner = users.find(u => u.id === currentOwnerId);

    return (
        <div className="flex items-center gap-3 bg-slate-800/40 px-3 py-1.5 rounded-full border border-white/5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Assigned To</span>
            <div className="flex items-center gap-2">
                {currentOwner && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400 border border-indigo-500/30">
                        {currentOwner.first_name[0]}{currentOwner.last_name[0]}
                    </div>
                )}
                <select 
                    className="bg-transparent border-none p-0 text-sm text-slate-200 focus:ring-0 cursor-pointer hover:text-white transition-colors appearance-none"
                    value={currentOwnerId || ''}
                    onChange={handleChange}
                    disabled={loading}
                >
                    <option value="" className="bg-slate-900 text-slate-400">Unassigned</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                            {u.first_name} {u.last_name}
                        </option>
                    ))}
                </select>
            </div>
            {loading && <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>
    );
}
