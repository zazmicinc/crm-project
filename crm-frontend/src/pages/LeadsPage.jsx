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
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Leads</h1>
                    <p className="text-slate-400 text-base mt-2 font-medium">{leads.length} total leads</p>
                </div>
                <button className="btn-primary shadow-lg shadow-indigo-500/20 px-6 py-3" onClick={() => setShowForm(true)}>
                    <span className="text-xl leading-none mb-0.5">+</span> New Lead
                </button>
            </div>

            {/* Search bar */}
            <div className="mb-10">
                <div className="relative max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 group-focus-within:text-indigo-400 transition-colors">🔍</span>
                    </div>
                    <input
                        className="input-field pl-12 py-3.5 shadow-sm bg-slate-800/50 border-slate-700 focus:bg-slate-800 transition-all"
                        placeholder="Search by name, email, or company…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-24">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-slate-400">Loading leads…</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="glass-card p-16 text-center max-w-lg mx-auto mt-8 border border-white/5 bg-slate-800/40">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-4xl opacity-80">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No leads found</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {search ? 'Try adjusting your search terms to find what you looking for.' : 'Get started by creating your first lead to track potential customers.'}
                    </p>
                    {!search && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            Create Lead
                        </button>
                    )}
                </div>
            ) : (
                /* Leads Table */
                <div className="glass-card overflow-hidden border border-white/5 shadow-xl bg-slate-900/40 backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="py-5 px-6">Name</th>
                                    <th className="py-5 px-6">Email</th>
                                    <th className="py-5 px-6">Company</th>
                                    <th className="py-5 px-6">Status</th>
                                    <th className="py-5 px-6">Source</th>
                                    <th className="py-5 px-6 text-right">Created At</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-5 px-6 font-medium text-slate-200">
                                            <Link to={`/leads/${lead.id}`} className="hover:text-indigo-400 transition-colors">
                                                {lead.first_name} {lead.last_name}
                                            </Link>
                                        </td>
                                        <td className="py-5 px-6 text-slate-400">{lead.email}</td>
                                        <td className="py-5 px-6 text-slate-400">{lead.company || <span className="text-slate-600 italic">None</span>}</td>
                                        <td className="py-5 px-6">
                                            <span className={`badge badge-${STATUS_COLORS[lead.status] || 'gray'} shadow-sm`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-slate-400">{lead.source || '-'}</td>
                                        <td className="py-5 px-6 text-right text-slate-500 text-sm tabular-nums">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-5 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/leads/${lead.id}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded hover:bg-indigo-500/10 transition-colors">
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
