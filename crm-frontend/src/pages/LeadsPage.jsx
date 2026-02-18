import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsApi } from '../api';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';

// Badge configuration for status
const BADGE_CLASSES = {
    New: 'crm-badge-new',
    Contacted: 'crm-badge-contacted',
    Qualified: 'crm-badge-qualified',
    Converted: 'crm-badge-converted',
    Dead: 'crm-badge-dead',
};

// Avatar gradient generator
const getAvatarGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #3b82f6, #6366f1)', // blue
        'linear-gradient(135deg, #f59e0b, #ef4444)', // amber-red
        'linear-gradient(135deg, #10b981, #3b82f6)', // green-blue
        'linear-gradient(135deg, #8b5cf6, #ec4899)', // purple-pink
        'linear-gradient(135deg, #06b6d4, #6366f1)', // cyan-indigo
        'linear-gradient(135deg, #f97316, #f59e0b)', // orange-amber
        'linear-gradient(135deg, #10b981, #059669)', // green-emerald
        'linear-gradient(135deg, #8b5cf6, #3b82f6)', // purple-blue
        'linear-gradient(135deg, #ef4444, #f97316)', // red-orange
        'linear-gradient(135deg, #6366f1, #8b5cf6)', // indigo-purple
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
        <div className="crm-page-container">
            <div className="crm-page-content">
                {/* Header */}
                <div className="crm-page-header">
                    <div className="crm-page-title-group">
                        <h1 className="crm-page-title">Leads</h1>
                        <p className="crm-page-subtitle"><span>{leads.length}</span> leads matching filters</p>
                    </div>
                    {hasPermission('leads.create') && (
                        <button className="crm-btn-primary" onClick={() => setShowForm(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                            New Lead
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="crm-stats-strip">
                    <div className="crm-stat-card">
                        <div className="crm-stat-label">Total Leads</div>
                        <div className="crm-stat-value">{stats.total}</div>
                        <div className="crm-stat-change">↑ 12% this month</div>
                    </div>
                    <div className="crm-stat-card">
                        <div className="crm-stat-label">Contacted</div>
                        <div className="crm-stat-value">{stats.contacted}</div>
                        <div className="crm-stat-change" style={{ color: 'var(--amber)' }}>30% of total</div>
                    </div>
                    <div className="crm-stat-card">
                        <div className="crm-stat-label">Qualified</div>
                        <div className="crm-stat-value">{stats.qualified}</div>
                        <div className="crm-stat-change">↑ On track</div>
                    </div>
                    <div className="crm-stat-card">
                        <div className="crm-stat-label">Converted</div>
                        <div className="crm-stat-value">{stats.converted}</div>
                        <div className="crm-stat-change" style={{ color: 'var(--purple-light)' }}>10% rate</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="crm-toolbar">
                    <div className="crm-search-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input 
                            type="text" 
                            placeholder="Search leads..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="crm-filter-tabs">
                        <button 
                            className={`crm-tab ${statusFilter === '' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('')}
                        >
                            ALL
                        </button>
                        {['New', 'Contacted', 'Qualified', 'Converted', 'Dead'].map(status => (
                            <button
                                key={status}
                                className={`crm-tab ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="crm-toolbar-right">
                        <button className="crm-btn-ghost">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                            Filter
                        </button>
                        <button className="crm-btn-ghost">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="crm-table-wrap">
                    <table className="crm-table">
                        <thead className="crm-thead">
                            <tr>
                                <th style={{ width: '36px' }} className="crm-th"><input type="checkbox" className="crm-cb" /></th>
                                <th className="crm-th">Name</th>
                                <th className="crm-th">Email</th>
                                <th className="crm-th">Company</th>
                                <th className="crm-th">Status</th>
                                <th className="crm-th">Source</th>
                                <th className="crm-th">Created</th>
                                <th className="crm-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="crm-tbody">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        Loading leads...
                                    </td>
                                </tr>
                            ) : paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        No leads found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => (
                                    <tr key={lead.id} onClick={() => {/* Navigate to detail if needed */}}>
                                        <td className="crm-td"><input type="checkbox" className="crm-cb" /></td>
                                        <td className="crm-td">
                                            <div className="crm-item-name">
                                                <div className="crm-item-avatar" style={{ background: getAvatarGradient(lead.first_name) }}>
                                                    {lead.first_name?.[0]}{lead.last_name?.[0]}
                                                </div>
                                                <span className="crm-item-name-text">
                                                    <Link to={`/leads/${lead.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {lead.first_name} {lead.last_name}
                                                    </Link>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="crm-td crm-td-secondary">{lead.email}</td>
                                        <td className="crm-td crm-td-secondary">{lead.company || '--'}</td>
                                        <td className="crm-td">
                                            <span className={`crm-badge ${BADGE_CLASSES[lead.status] || 'crm-badge-new'}`}>
                                                <span className="crm-badge-dot"></span>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="crm-td">
                                            <div className="crm-td-source">
                                                <span className="crm-source-dot"></span>
                                                {lead.source || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="crm-td crm-td-date">
                                            {new Date(lead.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="crm-td">
                                            <div className="crm-actions">
                                                <Link to={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                                                    <button className="crm-btn-action">Detail</button>
                                                </Link>
                                                <button className="crm-btn-action-icon">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="crm-pagination">
                        <div className="crm-pagination-info">
                            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, leads.length)} of {leads.length} leads
                        </div>
                        <div className="crm-pagination-controls">
                            <button 
                                className="crm-page-btn" 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ‹
                            </button>
                            <button className="crm-page-btn active">{page}</button>
                            <button 
                                className="crm-page-btn"
                                onClick={() => setPage(p => (p * pageSize < leads.length ? p + 1 : p))}
                                disabled={page * pageSize >= leads.length}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
