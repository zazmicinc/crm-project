import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { dashboardApi } from '../api';
import { motion } from 'framer-motion';

const PIE_COLORS = ['#0071E3', '#5E5CE6', '#30D158', '#FF9F0A', '#FF3B30', '#32ADE6'];

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
            <div className="w-8 h-8 border-2 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const formatCurrency = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-[40px] font-bold text-apple-text tracking-tight mb-2">Executive Overview</h1>
                <p className="text-[17px] text-apple-gray">Real-time sales performance and activity metrics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Pipeline" value={formatCurrency(summary.total_value)} change="↑ 12% vs last month" />
                <StatCard label="Open Deals" value={summary.deals} change="5 closing this week" />
                <StatCard label="Active Leads" value={summary.leads} change="↑ 8 new today" />
                <StatCard label="Total Contacts" value={summary.contacts} change="Active network" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Funnel Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="lg:col-span-2 bg-white rounded-3xl shadow-apple-sm p-8"
                >
                    <h3 className="text-[20px] font-semibold mb-8 text-apple-text">Sales Funnel (Deal Value)</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnel}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                                <XAxis dataKey="stage" stroke="#6E6E73" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6E6E73" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D2D2D7', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                                    itemStyle={{ color: '#1D1D1F', fontWeight: 500 }}
                                    cursor={{ fill: '#F5F5F7' }}
                                />
                                <Bar dataKey="value" fill="#0071E3" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="bg-white rounded-3xl shadow-apple-sm p-8"
                >
                    <h3 className="text-[20px] font-semibold mb-6 text-apple-text">Activity Mix</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activityStats.types}
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="type"
                                    stroke="none"
                                >
                                    {activityStats.types.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D2D2D7', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                                    itemStyle={{ color: '#1D1D1F', fontWeight: 500 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
                        {activityStats.types.map((t, i) => (
                            <div key={t.type} className="flex items-center gap-2 text-[14px] text-apple-gray">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                                <span className="capitalize truncate">{t.type}</span>
                                <span className="ml-auto font-semibold text-apple-text">{t.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="bg-white rounded-3xl shadow-apple-sm p-8"
                >
                    <h3 className="text-[20px] font-semibold mb-8 text-apple-text">Activity Trend (7 Days)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityStats.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071E3" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#6E6E73" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6E6E73" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D2D2D7', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                                    itemStyle={{ color: '#1D1D1F', fontWeight: 500 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#0071E3" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Deals Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="bg-white rounded-3xl shadow-apple-sm p-8 overflow-hidden"
                >
                    <h3 className="text-[20px] font-semibold mb-6 flex items-center gap-2 text-apple-text">
                        Recent Deals
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="pb-4 pt-0 px-2">Deal</th>
                                    <th className="pb-4 pt-0">Stage</th>
                                    <th className="pb-4 pt-0 text-right pr-2">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.recent_deals.map(d => (
                                    <tr key={d.id} className="border-b border-apple-bg last:border-0 hover:bg-apple-bg/50 transition-colors">
                                        <td className="py-4 px-2 text-[15px] font-medium text-apple-text">{d.title}</td>
                                        <td className="py-4">
                                            <span className={`badge badge-${d.stage.split('_')[0]}`}>
                                                {d.stage.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-2 text-right text-[15px] font-medium text-apple-text">{formatCurrency(d.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ label, value, change }) {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white rounded-[24px] p-8 shadow-apple-sm border border-transparent hover:border-black/[0.04]"
        >
            <div className="text-[14px] font-medium text-apple-gray uppercase tracking-widest mb-4">{label}</div>
            <div className="text-[48px] font-bold text-apple-text leading-none tracking-tight mb-2">{value}</div>
            <div className="text-[14px] text-apple-gray mt-4">{change}</div>
        </motion.div>
    );
}
