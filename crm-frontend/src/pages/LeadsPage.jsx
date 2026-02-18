import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsApi } from '../api';
import LeadForm from '../components/LeadForm';

const STATUS_COLORS = {
    New: 'blue',
    Contacted: 'yellow',
    Qualified: 'green',
    Converted: 'purple',
    Dead: 'gray',
};

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const data = await leadsApi.list(params);
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchLeads, 300);
        return () => clearTimeout(timer);
    }, [fetchLeads]);

    const handleCreate = async (data) => {
        try {
            await leadsApi.create(data);
            setShowForm(false);
            fetchLeads();
        } catch (err) {
            if (err.message.includes('409')) {
                alert('A lead with this email or phone already exists.');
            } else {
                alert('Failed to create lead: ' + err.message);
            }
        }
    };

    if (showForm) {
        return <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-slate-400 text-sm mt-1">{leads.length} total leads</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + New Lead
                </button>
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <input
                    className="input-field max-w-md"
                    placeholder="🔍  Search by name, email, or company…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading leads…</div>
            ) : leads.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">🎯</p>
                    <p className="text-slate-400">
                        {search ? 'No leads match your search.' : 'No leads yet. Create your first one!'}
                    </p>
                </div>
            ) : (
                /* Leads Table */
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 bg-white/5 text-slate-400 text-sm">
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Company</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Source</th>
                                    <th className="py-3 px-4 text-right">Created At</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-medium text-white">
                                            <Link to={`/leads/${lead.id}`} className="hover:text-indigo-400 transition-colors">
                                                {lead.first_name} {lead.last_name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{lead.email}</td>
                                        <td className="py-3 px-4 text-slate-400">{lead.company || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`badge badge-${STATUS_COLORS[lead.status] || 'gray'}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{lead.source || '-'}</td>
                                        <td className="py-3 px-4 text-right text-slate-500 text-sm">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link to={`/leads/${lead.id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
