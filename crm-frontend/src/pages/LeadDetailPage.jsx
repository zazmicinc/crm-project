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
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
                <button onClick={() => navigate('/leads')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    ← Back to Leads
                </button>
                <AssignOwner currentOwnerId={lead.owner_id} onAssign={handleAssign} />
            </div>

            <div className="glass-card p-8 relative overflow-hidden mb-6">
                <div className={`absolute top-0 left-0 w-full h-1 bg-${STATUS_COLORS[lead.status] || 'gray'}-500`} />
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{lead.first_name} {lead.last_name}</h1>
                        <div className="flex items-center gap-3">
                            <span className={`badge badge-${STATUS_COLORS[lead.status] || 'gray'}`}>
                                {lead.status}
                            </span>
                            <span className="text-slate-500 text-sm">Created {new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {lead.status !== 'Converted' && (
                            <>
                                <button
                                    onClick={() => setShowConvertModal(true)}
                                    className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 border-none text-white shadow-lg shadow-emerald-500/20"
                                >
                                    ✨ Convert
                                </button>
                                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                                    Edit
                                </button>
                            </>
                        )}
                        <button onClick={handleDelete} className="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-500 mb-1">Email</label>
                            <div className="text-slate-200 text-lg">{lead.email}</div>
                        </div>
                        <div>
                            <label className="block text-slate-500 mb-1">Phone</label>
                            <div className="text-slate-200 text-lg">{lead.phone || '-'}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-500 mb-1">Company</label>
                            <div className="text-slate-200 text-lg">{lead.company || '-'}</div>
                        </div>
                        <div>
                            <label className="block text-slate-500 mb-1">Source</label>
                            <div className="text-slate-200 text-lg">{lead.source || '-'}</div>
                        </div>
                    </div>
                </div>

                {lead.status === 'Converted' && (
                    <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                        <p className="text-purple-300 font-medium">🚀 This lead has been converted!</p>
                        <p className="text-slate-400 text-xs mt-1">Converted on {new Date(lead.converted_at).toLocaleDateString()}</p>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-700/50 mb-6 px-1">
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'overview' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === 'timeline' ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                    onClick={() => setActiveTab('timeline')}
                >
                    Timeline
                </button>
            </div>

            {activeTab === 'overview' ? (
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold mb-4">Lead Overview</h2>
                    <p className="text-slate-400 text-sm">Additional details and custom fields will appear here.</p>
                </div>
            ) : (
                <Timeline relatedToType="lead" relatedToId={id} />
            )}

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
