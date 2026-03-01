import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area,
    LineChart, Line, FunnelChart, Funnel, LabelList, Legend
} from 'recharts';
import { dashboardApi } from '../api';

const ZAZMIC_COLORS = ['#E63946', '#2B2D42', '#8D99AE', '#000000', '#D90429', '#EF233C'];

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [activityStats, setActivityStats] = useState({ types: [], trend: [] });
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('org'); // 'org', 'deals', 'leads'

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
            <div className="w-6 h-6 border-2 border-zazmic-red border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    // Mock data for Lead Analytics and Deal Insights
    const leadSources = [
        { name: 'Organic', value: 400 },
        { name: 'Referral', value: 300 },
        { name: 'Social', value: 300 },
        { name: 'Direct', value: 200 },
    ];

    const conversionData = [
        { name: 'Converted', value: 75, fill: '#E63946' },
        { name: 'Lost', value: 25, fill: '#E5E7EB' }
    ];

    return (
        <div className="pb-8 bg-gray-50 min-h-screen text-gray-900">
            {/* Header & Controls */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black mb-1">Analytics Dashboard</h1>
                    <p className="text-sm text-gray-500">Comprehensive real-time reporting & insights</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                    <button
                        onClick={() => setActiveView('org')}
                        className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeView === 'org' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                    >
                        Org Overview
                    </button>
                    <button
                        onClick={() => setActiveView('deals')}
                        className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeView === 'deals' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                    >
                        Deal Insights
                    </button>
                    <button
                        onClick={() => setActiveView('leads')}
                        className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeView === 'leads' ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-600 hover:text-black'}`}
                    >
                        Lead Analytics
                    </button>
                </div>
            </div>

            <div className="px-6">
                {/* Responsive Grid: 4 cols -> 3 cols -> 2 cols -> 1 col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total Pipeline" value={formatCurrency(summary.total_value)} change="+12% vs last month" bg="bg-white" textColor="text-zazmic-red" />
                    <StatCard label="Open Deals" value={summary.deals} change="5 closing this week" bg="bg-white" />
                    <StatCard label="Active Leads" value={summary.leads} change="+8 new today" bg="bg-white" />
                    <StatCard label="Total Contacts" value={summary.contacts} change="Active network" bg="bg-white" />
                </div>

                {/* View Conditional Rendering */}
                {activeView === 'org' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Area Chart: Activity Trend */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Activity Trend (7 Days)</h3>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityStats.trend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #D1D5DB' }} />
                                        <Area type="monotone" dataKey="count" stroke="#000000" fill="#E63946" strokeWidth={2} fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart: Activity Mix */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Activity Mix</h3>
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={activityStats.types}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="count"
                                            nameKey="type"
                                            stroke="none"
                                        >
                                            {activityStats.types.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ZAZMIC_COLORS[index % ZAZMIC_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #D1D5DB' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {activityStats.types.map((t, i) => (
                                    <div key={t.type} className="flex items-center text-xs text-gray-600">
                                        <div className="w-2 h-2 mr-2" style={{ backgroundColor: ZAZMIC_COLORS[i % ZAZMIC_COLORS.length] }}></div>
                                        <span className="capitalize">{t.type}</span>
                                        <span className="ml-auto font-bold text-black">{t.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Table: Recent Deals */}
                        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-0 overflow-hidden">
                            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black">Recent Deals Pipeline</h3>
                                <button className="text-sm text-zazmic-red hover:underline font-medium">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase">
                                            <th className="font-semibold p-4">Deal Name</th>
                                            <th className="font-semibold p-4">Current Stage</th>
                                            <th className="font-semibold p-4 text-right">Estimated Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-800">
                                        {summary.recent_deals.map((d, i) => (
                                            <tr key={d.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-gray-100`}>
                                                <td className="p-4 font-medium">{d.title}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 text-xs rounded border border-gray-300 bg-white font-medium capitalize">
                                                        {d.stage.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold">{formatCurrency(d.value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'deals' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Funnel Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Sales Funnel</h3>
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Tooltip contentStyle={{ borderRadius: '4px' }} />
                                        <Funnel
                                            dataKey="value"
                                            data={funnel.map((f, i) => ({ ...f, fill: ZAZMIC_COLORS[i % ZAZMIC_COLORS.length] }))}
                                            isAnimationActive
                                        >
                                            <LabelList position="right" fill="#000" stroke="none" dataKey="stage" fontSize={12} />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Pipeline by Stage */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Pipeline Value by Stage</h3>
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" stroke="#6B7280" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                        <YAxis dataKey="stage" type="category" stroke="#6B7280" fontSize={12} axisLine={false} tickLine={false} width={100} />
                                        <Tooltip contentStyle={{ borderRadius: '4px' }} cursor={{ fill: '#F3F4F6' }} />
                                        <Bar dataKey="value" fill="#E63946" barSize={20} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Deal Velocity</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={activityStats.trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '4px' }} />
                                        <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={3} dot={{ stroke: '#E63946', strokeWidth: 2, r: 4, fill: '#FAF9F6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'leads' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Gauge Chart (Half Pie) for Conversion Rate */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2 w-full text-left">Conversion Rate</h3>
                            <div className="h-[200px] w-full mt-4 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={conversionData}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
                                    <span className="text-4xl font-bold text-black">75%</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Avg Target 60%</span>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart: Lead Sources */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black border-b border-gray-100 pb-2">Lead Sources</h3>
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={leadSources} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #D1D5DB' }} cursor={{ fill: '#F3F4F6' }} />
                                        <Bar dataKey="value" fill="#2B2D42" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Data Table: Lead Pipeline */}
                        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-0 overflow-hidden">
                            <div className="p-5 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black">Top Growing Sources</h3>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase">
                                        <th className="font-semibold p-4">Source Channel</th>
                                        <th className="font-semibold p-4 text-right">Volume</th>
                                        <th className="font-semibold p-4 text-right">Conversion (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-800">
                                    {leadSources.map((s, i) => (
                                        <tr key={s.name} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-gray-100`}>
                                            <td className="p-4 font-medium">{s.name}</td>
                                            <td className="p-4 text-right font-bold">{s.value}</td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${i === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-black'}`}>
                                                    {(Math.random() * 20 + 10).toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, change, bg, textColor }) {
    return (
        <div className={`${bg} border border-gray-200 rounded-lg p-5 shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</div>
            </div>
            <div className={`text-3xl font-bold tracking-tight mb-2 ${textColor || 'text-black'}`}>{value}</div>
            <div className="text-xs text-gray-500 font-medium">
                <span className={change.includes('+') ? 'text-green-600' : change.includes('↑') ? 'text-green-600' : ''}>{change}</span>
            </div>
        </div>
    );
}

