import { useState } from 'react';

export default function LeadConvertModal({ lead, onConvert, onCancel }) {
    const [step, setStep] = useState(1);
    const [contact, setContact] = useState({
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company || '',
    });
    const [account, setAccount] = useState({
        name: lead.company || `${lead.first_name} ${lead.last_name}`,
        phone: lead.phone || '',
        email: lead.email || '',
    });
    const [deal, setDeal] = useState({
        title: `${lead.company || lead.first_name + ' ' + lead.last_name} Deal`,
        value: 0,
        stage: 'prospecting',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            // In a real app, you might send these overrides to the backend.
            // For now, the backend logic is fixed, but we'll simulate the flow.
            // If the backend supported overrides, we'd pass { contact, account, deal }
            await onConvert();
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-lg p-6 relative animate-scale-in">
                <h2 className="text-xl font-bold mb-4 text-white">Convert Lead</h2>
                
                {/* Stepper */}
                <div className="flex items-center justify-between mb-6 text-sm">
                    <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-indigo-500/20 border border-indigo-500' : 'bg-slate-800'}`}>1</div>
                        Contact
                    </div>
                    <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                    <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-indigo-500/20 border border-indigo-500' : 'bg-slate-800'}`}>2</div>
                        Account
                    </div>
                    <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                    <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= 3 ? 'bg-indigo-500/20 border border-indigo-500' : 'bg-slate-800'}`}>3</div>
                        Deal
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Contact */}
                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Review the Contact to be created:</p>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Name</label>
                            <input className="input-field" value={contact.name} onChange={e => setContact({...contact, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Email</label>
                            <input className="input-field" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} />
                        </div>
                    </div>
                )}

                {/* Step 2: Account */}
                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Review the Account to be created:</p>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Account Name</label>
                            <input className="input-field" value={account.name} onChange={e => setAccount({...account, name: e.target.value})} />
                        </div>
                    </div>
                )}

                {/* Step 3: Deal */}
                {step === 3 && (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Review the Deal to be created:</p>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Deal Title</label>
                            <input className="input-field" value={deal.title} onChange={e => setDeal({...deal, title: e.target.value})} />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-8">
                    <button className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                    {step > 1 && (
                        <button className="btn-secondary" onClick={() => setStep(step - 1)} disabled={isSubmitting}>Back</button>
                    )}
                    {step < 3 ? (
                        <button className="btn-primary" onClick={() => setStep(step + 1)}>Next</button>
                    ) : (
                        <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Converting...' : 'Confirm Conversion'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
