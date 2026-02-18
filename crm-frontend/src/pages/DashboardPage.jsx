import { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { dashboardApi } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [activityStats, setActivityStats] = useState({ types: [], trend: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [s, f, a] = await Promise.all([
                    dashboardApi.getSummary(),
                    dashboardApi.getFunnel(),
                    dashboardApi.getActivityStats()
                ]);
                setSummary(s);
                setFunnel(f);
                setActivityStats(a);
            } catch (err) {
                console.error("Dashboard fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    const formatCurrency = (v) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">Executive Overview</h1>
                <p className="text-slate-400 mt-1">Real-time sales performance and activity metrics</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Pipeline" value={formatCurrency(summary.total_value)} icon="💰" color="emerald" />
                <StatCard title="Open Deals" value={summary.deals} icon="📊" color="indigo" />
                <StatCard title="Active Leads" value={summary.leads} icon="🎯" color="purple" />
                <StatCard title="Total Contacts" value={summary.contacts} icon="👥" color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-indigo-400">📈</span> Sales Funnel (Deal Value)
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnel}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Pie */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-purple-400">⚡</span> Activity Mix
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activityStats.types}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="type"
                                >
                                    {activityStats.types.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {activityStats.types.map((t, i) => (
                            <div key={t.type} className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="capitalize">{t.type}</span>
                                <span className="ml-auto font-bold text-slate-200">{t.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-blue-400">🌊</span> Activity Trend (7 Days)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityStats.trend}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Deals Table */}
                <div className="glass-card p-6 overflow-hidden">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-emerald-400">✨</span> Recent Deals
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-3">Deal</th>
                                    <th className="pb-3">Stage</th>
                                    <th className="pb-3 text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {summary.recent_deals.map(d => (
                                    <tr key={d.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 text-sm font-medium text-slate-200">{d.title}</td>
                                        <td className="py-3">
                                            <span className={`badge badge-${d.stage} text-[10px]`}>{d.stage.replace('_', ' ')}</span>
                                        </td>
                                        <td className="py-3 text-right text-sm font-mono text-emerald-400">{formatCurrency(d.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
        blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    };

    return (
        <div className={`glass-card p-6 border bg-gradient-to-br ${colorClasses[color]} relative group overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 text-3xl opacity-20 group-hover:scale-125 transition-transform duration-500">
                {icon}
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
    );
}
