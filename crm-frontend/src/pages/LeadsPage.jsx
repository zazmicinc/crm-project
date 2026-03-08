import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../api';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { ListTable } from '../components/shared/ListTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate } from '../utils/formatDate';

const GRADE_STYLE = {
    Hot:  { bg: '#fff0f0', color: '#e8192c', dot: '#e8192c' },
    Warm: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
    Cold: { bg: '#f9fafb', color: '#6b7280', dot: '#9ca3af' },
};

function GradeBadge({ grade }) {
    const cfg = GRADE_STYLE[grade] || GRADE_STYLE.Cold;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.bg, color: cfg.color,
            padding: '4px 10px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            {grade}
        </span>
    );
}

const columns = [
    {
        key: 'name', label: 'Name', width: '1fr',
        render: (lead) => (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                {lead.first_name} {lead.last_name}
            </span>
        )
    },
    {
        key: 'email', label: 'Email', width: '1fr',
        render: (lead) => <span style={{ fontSize: 13, color: '#666' }}>{lead.email}</span>
    },
    {
        key: 'company', label: 'Company', width: '1fr',
        render: (lead) => <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>{lead.company || '—'}</span>
    },
    {
        key: 'job_title', label: 'Job Title', width: '140px',
        render: (lead) => <span style={{ fontSize: 13, color: '#666' }}>{lead.job_title || '—'}</span>
    },
    {
        key: 'score', label: 'Score', width: '110px',
        render: (lead) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', minWidth: 24 }}>{lead.lead_score ?? 0}</span>
                <GradeBadge grade={lead.lead_grade || 'Cold'} />
            </div>
        )
    },
    {
        key: 'status', label: 'Status', width: '130px',
        render: (lead) => <StatusBadge status={lead.status} />
    },
    {
        key: 'source', label: 'Source', width: '110px',
        render: (lead) => <span style={{ fontSize: 13, color: '#888' }}>{lead.source || '—'}</span>
    },
    {
        key: 'created', label: 'Created', width: '120px',
        render: (lead) => <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(lead.created_at)}</span>
    },
];

export default function LeadsPage() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
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

    const paginatedLeads = leads.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(leads.length / pageSize);

    if (showForm) {
        return <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    const headerExtra = (
        <>
            <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input
                    style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, width: 200, outline: 'none' }}
                    type="text"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8, padding: 4 }}>
                {['', 'New', 'Contacted', 'Qualified', 'Converted', 'Dead'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        style={{
                            padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12,
                            fontWeight: 500, cursor: 'pointer',
                            background: statusFilter === s ? '#fff' : 'transparent',
                            color: statusFilter === s ? '#0a0a0a' : '#999',
                            boxShadow: statusFilter === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <div className="animate-fade-in pb-12">
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                    <div style={{ width: 28, height: 28, border: '2px solid #e8192c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <p style={{ fontSize: 14, color: '#aaa' }}>Loading leads...</p>
                </div>
            ) : (
                <ListTable
                    title="All Leads"
                    breadcrumb="CRM / Leads"
                    columns={columns}
                    rows={paginatedLeads}
                    newButtonLabel="+ New Lead"
                    onNew={hasPermission('leads.create') ? () => setShowForm(true) : () => {}}
                    onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
                    totalCount={leads.length}
                    currentPage={page}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    headerExtra={headerExtra}
                />
            )}
        </div>
    );
}
