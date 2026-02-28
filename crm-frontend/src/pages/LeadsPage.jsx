import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsApi } from '../api';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Avatar gradient generator
const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #E63946, #D62828)', // blue
        'linear-gradient(135deg, #FF9F0A, #FF3B30)', // orange-red
        'linear-gradient(135deg, #30D158, #D62828)', // green-blue
        'linear-gradient(135deg, #5E5CE6, #FF2D55)', // purple-pink
    ];
    if (!name) return gradients[0];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
};

export default function LeadsPage() {
    const { hasPermission } = useAuth();
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const data = await leadsApi.list(params);
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

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

    // Calculate stats
    const stats = {
        total: leads.length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        qualified: leads.filter(l => l.status === 'Qualified').length,
        converted: leads.filter(l => l.status === 'Converted').length,
    };

    const paginatedLeads = leads.slice((page - 1) * pageSize, page * pageSize);

    if (showForm) {
        return <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-[40px] font-bold text-zazmic-black tracking-tight mb-2">Leads</h1>
                    <p className="text-[17px] text-zazmic-gray-500">
                        <span className="font-semibold text-zazmic-black">{leads.length}</span> leads matching filters
                    </p>
                </div>
                {hasPermission('leads.create') && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                        New Lead
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Leads" value={stats.total} change="↑ 12% this month" />
                <StatCard label="Contacted" value={stats.contacted} change="30% of total" />
                <StatCard label="Qualified" value={stats.qualified} change="↑ On track" />
                <StatCard label="Converted" value={stats.converted} change="10% rate" />
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-[24px] shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zazmic-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input
                        className="w-full bg-zazmic-gray-100 rounded-full pl-11 pr-4 py-3 text-[15px] focus:outline-none focus:border-zazmic-red border border-transparent transition-all placeholder:text-zazmic-gray-500"
                        type="text"
                        placeholder="Search leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex bg-zazmic-gray-100 p-1 rounded-full overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <button
                        className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${statusFilter === '' ? 'bg-white shadow-sm text-zazmic-black' : 'text-zazmic-gray-500 hover:text-zazmic-black'}`}
                        onClick={() => setStatusFilter('')}
                    >
                        All
                    </button>
                    {['New', 'Contacted', 'Qualified', 'Converted', 'Dead'].map(status => (
                        <button
                            key={status}
                            className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white shadow-sm text-zazmic-black' : 'text-zazmic-gray-500 hover:text-zazmic-black'}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100 w-12"><input type="checkbox" className="rounded text-zazmic-red focus:ring-zazmic-red w-4 h-4 cursor-pointer" /></th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Name</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Email</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Company</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Status</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Source</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100">Created</th>
                                <th className="py-4 px-6 text-[12px] font-semibold text-zazmic-gray-500 uppercase tracking-wider border-b border-zazmic-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-zazmic-gray-500 text-[15px]">
                                        <div className="flex justify-center mb-4"><div className="w-6 h-6 border-2 border-zazmic-red border-t-transparent rounded-full animate-spin"></div></div>
                                        Fetching leads...
                                    </td>
                                </tr>
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-16 text-zazmic-gray-500 text-[15px]">
                                        <div className="text-[48px] mb-4">🔍</div>
                                        No leads found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-zazmic-gray-100 transition-colors cursor-pointer border-b border-zazmic-gray-100 last:border-0">
                                        <td className="py-4 px-6"><input type="checkbox" className="rounded text-zazmic-red focus:ring-zazmic-red w-4 h-4 cursor-pointer" /></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-[14px] shrink-0" style={{ background: getAvatarGradient(lead.first_name) }}>
                                                    {lead.first_name?.[0]}{lead.last_name?.[0]}
                                                </div>
                                                <Link to={`/leads/${lead.id}`} className="font-medium text-[15px] text-zazmic-black hover:text-zazmic-red transition-colors">
                                                    {lead.first_name} {lead.last_name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">{lead.email}</td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">{lead.company || '--'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`badge badge-${lead.status.toLowerCase()}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">
                                            {lead.source || 'Unknown'}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-zazmic-gray-500">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link to={`/leads/${lead.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zazmic-gray-100 text-zazmic-gray-500 hover:bg-zazmic-red hover:text-white transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-zazmic-gray-100 flex items-center justify-between text-[14px]">
                    <div className="text-zazmic-gray-500 font-medium">
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, leads.length)} of {leads.length} leads
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-zazmic-gray-300 text-zazmic-gray-500 hover:bg-zazmic-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center bg-zazmic-red text-white font-medium">{page}</button>
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-zazmic-gray-300 text-zazmic-gray-500 hover:bg-zazmic-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={() => setPage(p => (p * pageSize < leads.length ? p + 1 : p))}
                            disabled={page * pageSize >= leads.length}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, change }) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="text-[13px] font-semibold text-zazmic-gray-500 uppercase tracking-widest mb-3">{label}</div>
            <div className="text-[36px] font-bold text-zazmic-black leading-none tracking-tight mb-2">{value}</div>
            <div className="text-[14px] text-zazmic-gray-500">{change}</div>
        </div>
    );
}
