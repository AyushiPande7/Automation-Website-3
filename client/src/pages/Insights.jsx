import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/ideas';

const COLORS = ['#EB0A1E', '#1F2937', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export default function Insights() {
  const [stats, setStats] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ideasRes] = await Promise.all([
          API.getStats(),
          API.getIdeas()
        ]);
        setStats(statsRes.data);
        setIdeas(ideasRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const statusData = stats?.byStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const categoryData = stats?.byCategory?.map(c => ({ name: c._id, count: c.count })) || [];

  // Prepare per-project impact data
  const idCounts = {};
  const projectImpactData = ideas.map(idea => {
    let id = idea.customId || `WS-${String(idea._id).toUpperCase().slice(-6)}`;
    // Handle duplicate IDs gracefully
    if (idCounts[id]) {
        idCounts[id]++;
        id = `${id} (${idCounts[id]})`;
    } else {
        idCounts[id] = 1;
    }
    
    return {
      name: id,
      hoursSaved: Number(idea.hoursSaved) || 0,
      costSaved: Number(idea.costSaved) || 0,
      title: idea.title
    };
  });

  const chartWidth = Math.max(100, projectImpactData.length * 70);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/ideas" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Idea Insights
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500" />
              Status Distribution
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Category Overview
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Business Impact Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white border border-gray-100 shadow-sm rounded-3xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Impact</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Quantitative tracking of value delivered. These metrics reflect estimated annual savings across all implemented and approved projects.
              </p>
              <div className="space-y-4">
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
                  <p className="text-primary-600 text-xs font-bold uppercase tracking-widest mb-1">Total Hours Saved</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{stats?.impact?.totalHours || 0}</span>
                    <span className="text-slate-500 font-bold text-sm">Hrs</span>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-1">Total Cost Savings</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">${stats?.impact?.totalCost || 0}</span>
                    <span className="text-slate-500 font-bold text-sm">USD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-[400px] bg-slate-50 rounded-3xl p-6 border border-gray-100">
               {/* <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Hours Saved', value: stats?.impact?.totalHours || 0, color: '#EB0A1E' },
                  { name: 'Cost Saved ($)', value: stats?.impact?.totalCost || 0, color: '#10B981' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#cbd5e1', opacity: 0.2 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    <Cell fill="#EB0A1E" />
                    <Cell fill="#10B981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[350px]">
                
                {/* Hours Saved Chart */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    Hours Saved per Project
                  </h4>

                  {projectImpactData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
                      No project data available
                    </div>
                  ) : (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ minHeight: '300px' }}>
                      <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={projectImpactData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              angle={-45}
                              textAnchor="end"
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                              cursor={{ fill: '#cbd5e1', opacity: 0.2 }}
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 10px rgb(0 0 0 / 0.1)',
                              }}
                              formatter={(value) => [value, 'Hours Saved']}
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.title || label}
                            />
                            <Bar dataKey="hoursSaved" fill="#EB0A1E" radius={[6, 6, 0, 0]} maxBarSize={60} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost Saved Chart */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    Cost Saved (USD) per Project
                  </h4>

                  {projectImpactData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
                      No project data available
                    </div>
                  ) : (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ minHeight: '300px' }}>
                      <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={projectImpactData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              angle={-45}
                              textAnchor="end"
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip
                              cursor={{ fill: '#cbd5e1', opacity: 0.2 }}
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 10px rgb(0 0 0 / 0.1)',
                              }}
                              formatter={(value) => [`$${value}`, 'Cost Saved']}
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.title || label}
                            />
                            <Bar dataKey="costSaved" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
