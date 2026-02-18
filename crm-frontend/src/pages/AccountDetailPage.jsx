import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { accountsApi } from '../api';
import AssignOwner from '../components/AssignOwner';
import Timeline from '../components/Timeline';

export default function AccountDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contacts');

    const fetchData = async () => {
        try {
            const [accData, contactsData, dealsData] = await Promise.all([
                accountsApi.get(id),
                accountsApi.getContacts(id),
                accountsApi.getDeals(id)
            ]);
            setAccount(accData);
            setContacts(contactsData);
            setDeals(dealsData);
        } catch (err) {
            console.error(err);
            if (err.message.includes('404')) navigate('/accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, navigate]);

    const handleAssign = async (userId) => {
        await accountsApi.assign(id, userId);
        fetchData();
    };

    if (loading) return <div className="text-center py-20 text-slate-400">Loading account details…</div>;
    if (!account) return null;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
                <button onClick={() => navigate('/accounts')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    ← Back to Accounts
                </button>
                <AssignOwner currentOwnerId={account.owner_id} onAssign={handleAssign} />
            </div>

            {/* Account Header */}
            <div className="glass-card p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <h1 className="text-3xl font-bold text-white mb-2">{account.name}</h1>
                <div className="flex flex-wrap gap-4 text-slate-400 text-sm mt-4">
                    {account.industry && (
                        <div className="flex items-center gap-2">
                            <span className="badge badge-qualification">{account.industry}</span>
                        </div>
                    )}
                    {account.website && (
                        <div className="flex items-center gap-2">
                            <span>🌐</span>
                            <a href={account.website} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
                                {account.website}
                            </a>
                        </div>
                    )}
                    {account.phone && (
                        <div className="flex items-center gap-2">
                            <span>📞</span>
                            <span>{account.phone}</span>
                        </div>
                    )}
                    {account.email && (
                        <div className="flex items-center gap-2">
                            <span>✉️</span>
                            <span>{account.email}</span>
                        </div>
                    )}
                </div>
                {account.address && (
                    <div className="mt-4 text-slate-400 text-sm border-t border-slate-700/50 pt-4">
                        <p className="font-semibold text-slate-300 mb-1">Address</p>
                        <p className="whitespace-pre-line">{account.address}</p>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-700 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative shrink-0 ${
                        activeTab === 'contacts' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Contacts ({contacts.length})
                    {activeTab === 'contacts' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('deals')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative shrink-0 ${
                        activeTab === 'deals' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Deals ({deals.length})
                    {activeTab === 'deals' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative shrink-0 ${
                        activeTab === 'timeline' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Timeline
                    {activeTab === 'timeline' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'contacts' && (
                    contacts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No contacts linked to this account.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Phone</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-medium text-white">{contact.name}</td>
                                            <td className="py-3 px-4 text-slate-400">{contact.email}</td>
                                            <td className="py-3 px-4 text-slate-400">{contact.phone || '-'}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Link to={`/contacts/${contact.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {activeTab === 'deals' && (
                    deals.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No deals linked to this account.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="py-3 px-4">Deal Title</th>
                                        <th className="py-3 px-4">Value</th>
                                        <th className="py-3 px-4">Stage</th>
                                        <th className="py-3 px-4 text-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deals.map((deal) => (
                                        <tr key={deal.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-medium text-white">{deal.title}</td>
                                            <td className="py-3 px-4 text-emerald-400 font-mono">
                                                ${deal.value?.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`badge badge-${deal.stage.replace('_', '-')}`}>
                                                    {deal.stage.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-500 text-sm">
                                                {new Date(deal.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {activeTab === 'timeline' && (
                    <Timeline relatedToType="account" relatedToId={id} />
                )}
            </div>
        </div>
    );
}
