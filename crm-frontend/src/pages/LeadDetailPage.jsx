import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { leadsApi } from '../api';
import LeadForm from '../components/LeadForm';
import LeadConvertModal from '../components/LeadConvertModal';
import AssignOwner from '../components/AssignOwner';
import Timeline from '../components/Timeline';

const STATUS_COLORS = {
    New: 'blue',
    Contacted: 'yellow',
    Qualified: 'green',
    Converted: 'purple',
    Dead: 'gray',
};

export default function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchLead = useCallback(async () => {
        try {
            const data = await leadsApi.get(id);
            setLead(data);
        } catch (err) {
            console.error(err);
            if (err.message.includes('404')) navigate('/leads');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchLead();
    }, [fetchLead]);

    const handleUpdate = async (data) => {
        await leadsApi.update(id, data);
        setIsEditing(false);
        fetchLead();
    };

    const handleAssign = async (userId) => {
        await leadsApi.assign(id, userId);
        fetchLead();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this lead?')) return;
        await leadsApi.delete(id);
        navigate('/leads');
    };

    const handleConvert = async () => {
        const res = await leadsApi.convert(id, {});
        if (res.deal_id) {
            navigate(`/deals/${res.deal_id}`);
        } else {
            navigate('/deals');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400">Loading lead details…</div>;
    if (!lead) return null;

    if (isEditing) {
        return (
            <div className="max-w-2xl mx-auto">
                <LeadForm
                    lead={lead}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between mt-5">
                <button onClick={() => navigate('/leads')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    ← Back to Leads
                </button>
                <AssignOwner currentOwnerId={lead.owner_id} onAssign={handleAssign} />
            </div>

            <div className="glass-card p-10 relative overflow-hidden shadow-2xl">
                <div className={`absolute top-0 left-0 w-full h-1 bg-${STATUS_COLORS[lead.status] || 'gray'}-500`} />
                
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{lead.first_name} {lead.last_name}</h1>
                        <div className="flex items-center gap-4">
                            <span className={`badge badge-${STATUS_COLORS[lead.status] || 'gray'} px-3 py-1`}>
                                {lead.status}
                            </span>
                            <span className="text-slate-500 text-sm font-mono">Created {new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        {lead.status !== 'Converted' && (
                            <>
                                <button
                                    onClick={() => setShowConvertModal(true)}
                                    className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white shadow-lg shadow-emerald-500/20 px-6"
                                >
                                    ✨ Convert
                                </button>
                                <button onClick={() => setIsEditing(true)} className="btn-secondary px-6">
                                    Edit
                                </button>
                            </>
                        )}
                        <button onClick={handleDelete} className="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20 px-6">
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                    <div className="space-y-6">
                        <div className="mt-[10px]">
                            <label className="block text-slate-500 mb-2 uppercase tracking-wider text-[10px] font-bold">Email Address</label>
                            <div className="text-slate-200 text-xl font-medium">{lead.email}</div>
                        </div>
                        <div className="mt-[10px]">
                            <label className="block text-slate-500 mb-2 uppercase tracking-wider text-[10px] font-bold">Phone Number</label>
                            <div className="text-slate-200 text-xl font-medium">{lead.phone || '-'}</div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-slate-500 mb-2 uppercase tracking-wider text-[10px] font-bold">Company Name</label>
                            <div className="text-slate-200 text-xl font-medium">{lead.company || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-slate-500 mb-2 uppercase tracking-wider text-[10px] font-bold">Lead Source</label>
                            <div className="text-slate-200 text-xl font-medium">{lead.source || '-'}</div>
                        </div>
                    </div>
                </div>

                {lead.status === 'Converted' && (
                    <div className="mt-12 p-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                        <p className="text-purple-300 text-lg font-semibold">🚀 This lead has been converted!</p>
                        <p className="text-slate-400 text-sm mt-2">Converted on {new Date(lead.converted_at).toLocaleDateString()}</p>
                    </div>
                )}
            </div>

            <div className="space-y-8 mt-5">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-white/5 px-2">
                    <button
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                            activeTab === 'overview' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-white'
                        }`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
                            activeTab === 'timeline' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-white'
                        }`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        Timeline
                    </button>
                </div>

                <div className="crm-animate-fade-up">
                    {activeTab === 'overview' ? (
                        <div className="glass-card p-10">
                            <h2 className="text-xl font-bold mb-6 text-white mt-[10px]">Lead Information</h2>
                            <p className="text-slate-400 leading-relaxed">Additional details and custom fields will appear here as the lead progresses through the pipeline.</p>
                        </div>
                    ) : (
                        <Timeline relatedToType="lead" relatedToId={id} />
                    )}
                </div>
            </div>

            {showConvertModal && (
                <LeadConvertModal
                    lead={lead}
                    onConvert={handleConvert}
                    onCancel={() => setShowConvertModal(false)}
                />
            )}
        </div>
    );
}
