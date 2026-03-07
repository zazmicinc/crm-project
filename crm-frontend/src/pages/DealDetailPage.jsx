import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dealsApi, contactsApi, productsApi } from '../api';
import DealForm from '../components/DealForm';
import Timeline from '../components/Timeline';
import AssignOwner from '../components/AssignOwner';

export default function DealDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Related contacts state
    const [relatedContacts, setRelatedContacts] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [addContactId, setAddContactId] = useState('');
    const [addContactRole, setAddContactRole] = useState('');
    const [contactError, setContactError] = useState('');

    // Line items state
    const [lineItems, setLineItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit_price_override: '', discount_pct: 0 });
    const [lineItemError, setLineItemError] = useState('');

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    const fetchData = async () => {
        setLoading(true);
        try {
            const d = await dealsApi.get(id);
            setDeal(d);
        } catch {
            navigate('/deals');
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        const [rc, ac] = await Promise.all([dealsApi.getContacts(id), contactsApi.list()]);
        setRelatedContacts(rc);
        setAllContacts(ac);
    };

    const fetchLineItems = async () => {
        const [items, prods] = await Promise.all([dealsApi.getLineItems(id), productsApi.list()]);
        setLineItems(items);
        setProducts(prods);
    };

    useEffect(() => { fetchData(); }, [id]);

    useEffect(() => {
        if (activeTab === 'contacts') fetchContacts();
        if (activeTab === 'lineitems') fetchLineItems();
    }, [activeTab]);

    const handleUpdate = async (data) => {
        await dealsApi.update(id, data);
        setEditing(false);
        fetchData();
    };

    const handleAssign = async (userId) => {
        await dealsApi.assign(id, userId);
        fetchData();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this deal?')) return;
        await dealsApi.delete(id);
        navigate('/deals');
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        setContactError('');
        try {
            await dealsApi.addContact(id, { contact_id: parseInt(addContactId), role: addContactRole || null });
            setAddContactId('');
            setAddContactRole('');
            fetchContacts();
            fetchData();
        } catch (err) {
            setContactError(err.message);
        }
    };

    const handleRemoveContact = async (contactId) => {
        await dealsApi.removeContact(id, contactId);
        fetchContacts();
        fetchData();
    };

    const handleAddLineItem = async (e) => {
        e.preventDefault();
        setLineItemError('');
        try {
            await dealsApi.addLineItem(id, {
                product_id: parseInt(newItem.product_id),
                quantity: parseFloat(newItem.quantity),
                unit_price_override: newItem.unit_price_override !== '' ? parseFloat(newItem.unit_price_override) : null,
                discount_pct: parseFloat(newItem.discount_pct),
            });
            setNewItem({ product_id: '', quantity: 1, unit_price_override: '', discount_pct: 0 });
            fetchLineItems();
            fetchData();
        } catch (err) {
            setLineItemError(err.message);
        }
    };

    const handleDeleteLineItem = async (itemId) => {
        await dealsApi.deleteLineItem(id, itemId);
        fetchLineItems();
        fetchData();
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading…</div>;
    }

    if (editing) {
        return <DealForm deal={deal} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />;
    }

    const linkedContactIds = new Set(relatedContacts.map((c) => c.id));
    const availableContacts = allContacts.filter((c) => c.id !== deal.contact_id && !linkedContactIds.has(c.id));

    return (
        <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/deals" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    ← Back to Deals
                </Link>
                <AssignOwner currentOwnerId={deal.owner_id} onAssign={handleAssign} />
            </div>

            {/* Header */}
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{deal.title}</h1>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                            <span className="font-mono text-emerald-400 font-bold text-lg">{formatCurrency(deal.value)}</span>
                            <span className={`badge badge-${deal.stage}`}>{deal.stage.replace('_', ' ')}</span>
                            {deal.account_name && <span>🏢 {deal.account_name}</span>}
                            {deal.close_date && (
                                <span>📅 {new Date(deal.close_date).toLocaleDateString()}</span>
                            )}
                            {deal.effective_probability != null && (
                                <span className="text-indigo-400">{deal.effective_probability}%</span>
                            )}
                        </div>
                        {deal.stage === 'closed_lost' && deal.loss_reason && (
                            <div className="mt-2 text-sm text-red-400">
                                Lost: {deal.loss_reason}{deal.loss_reason_note ? ` — ${deal.loss_reason_note}` : ''}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>
                        <button className="btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-700/50 mb-6 px-1">
                {['overview', 'contacts', 'lineitems', 'timeline'].map((tab) => (
                    <button
                        key={tab}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 capitalize ${
                            activeTab === tab ? 'text-indigo-400 border-indigo-400' : 'text-slate-400 border-transparent hover:text-white'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'lineitems' ? 'Line Items' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="glass-card p-5">
                    <h2 className="text-lg font-bold mb-4">Deal Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Primary Contact</p>
                            <Link to={`/contacts/${deal.contact_id}`} className="text-indigo-400 hover:underline">
                                {deal.contact_name || 'View Contact'}
                            </Link>
                        </div>
                        <div>
                            <p className="text-slate-500">Pipeline Stage</p>
                            <p className="text-slate-300">{deal.stage.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Close Date</p>
                            <p className="text-slate-300">{deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Probability</p>
                            <p className="text-slate-300">
                                {deal.effective_probability != null ? `${deal.effective_probability}%` : '—'}
                                {deal.probability_override != null && <span className="ml-1 text-xs text-indigo-400">(manual)</span>}
                            </p>
                        </div>
                        {deal.stage === 'closed_lost' && (
                            <>
                                <div>
                                    <p className="text-slate-500">Loss Reason</p>
                                    <p className="text-red-400">{deal.loss_reason || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Loss Note</p>
                                    <p className="text-slate-300">{deal.loss_reason_note || '—'}</p>
                                </div>
                            </>
                        )}
                        <div>
                            <p className="text-slate-500">Created At</p>
                            <p className="text-slate-300">{new Date(deal.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className="glass-card p-5 space-y-5">
                    <h2 className="text-lg font-bold">Related Contacts</h2>
                    {contactError && <p className="text-red-400 text-sm">{contactError}</p>}
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-700">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Email</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedContacts.length === 0 && (
                                <tr><td colSpan={4} className="py-4 text-slate-500 text-center">No related contacts yet.</td></tr>
                            )}
                            {relatedContacts.map((c) => (
                                <tr key={c.id} className="border-b border-slate-800">
                                    <td className="py-2">
                                        <Link to={`/contacts/${c.id}`} className="text-indigo-400 hover:underline">{c.name}</Link>
                                    </td>
                                    <td className="py-2 text-slate-400">{c.email}</td>
                                    <td className="py-2 text-slate-400">—</td>
                                    <td className="py-2 text-right">
                                        <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => handleRemoveContact(c.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {availableContacts.length > 0 && (
                        <form onSubmit={handleAddContact} className="flex gap-3 items-end">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Add Contact</label>
                                <select className="input-field text-sm" value={addContactId} onChange={(e) => setAddContactId(e.target.value)} required>
                                    <option value="">Select contact</option>
                                    {availableContacts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Role (optional)</label>
                                <input className="input-field text-sm" placeholder="e.g. Decision Maker" value={addContactRole} onChange={(e) => setAddContactRole(e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary text-sm">Add</button>
                        </form>
                    )}
                </div>
            )}

            {activeTab === 'lineitems' && (
                <div className="glass-card p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Line Items</h2>
                        <span className="text-emerald-400 font-bold">{formatCurrency(deal.value)}</span>
                    </div>
                    {lineItemError && <p className="text-red-400 text-sm">{lineItemError}</p>}
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-700">
                                <th className="pb-2">Product</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2">Unit Price</th>
                                <th className="pb-2">Discount</th>
                                <th className="pb-2 text-right">Subtotal</th>
                                <th className="pb-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.length === 0 && (
                                <tr><td colSpan={6} className="py-4 text-slate-500 text-center">No line items yet.</td></tr>
                            )}
                            {lineItems.map((item) => (
                                <tr key={item.id} className="border-b border-slate-800">
                                    <td className="py-2">{item.product.name}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{formatCurrency(item.unit_price_override ?? item.product.unit_price)}</td>
                                    <td className="py-2">{item.discount_pct}%</td>
                                    <td className="py-2 text-right text-emerald-400">{formatCurrency(item.subtotal)}</td>
                                    <td className="py-2 text-right">
                                        <button className="text-red-400 hover:text-red-300 text-xs" onClick={() => handleDeleteLineItem(item.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length > 0 && (
                        <form onSubmit={handleAddLineItem} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Product</label>
                                <select className="input-field text-sm" value={newItem.product_id} onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })} required>
                                    <option value="">Select product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.unit_price)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Qty</label>
                                <input className="input-field text-sm" type="number" min="0.01" step="0.01" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Price Override</label>
                                <input className="input-field text-sm" type="number" min="0" step="0.01" placeholder="Default" value={newItem.unit_price_override} onChange={(e) => setNewItem({ ...newItem, unit_price_override: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Discount %</label>
                                <input className="input-field text-sm" type="number" min="0" max="100" step="0.1" value={newItem.discount_pct} onChange={(e) => setNewItem({ ...newItem, discount_pct: e.target.value })} />
                            </div>
                            <div className="col-span-2 md:col-span-4">
                                <button type="submit" className="btn-primary text-sm">Add Line Item</button>
                            </div>
                        </form>
                    )}
                    {products.length === 0 && (
                        <p className="text-slate-500 text-sm">No products available. Add products first.</p>
                    )}
                </div>
            )}

            {activeTab === 'timeline' && (
                <Timeline relatedToType="deal" relatedToId={id} />
            )}
        </div>
    );
}
