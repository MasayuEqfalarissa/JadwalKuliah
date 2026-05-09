import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Calendar, CheckSquare, Clock, BookOpen, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ schedules: 0, pendingTasks: 0, exams: 0 });
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [schedRes, taskRes, examRes] = await Promise.all([
                    api.get('/schedules'),
                    api.get('/assignments'),
                    api.get('/exams')
                ]);

                const tasks = taskRes.data;
                const completedTasks = tasks.filter(t => t.status === 'completed');
                const pendingTasks = tasks.filter(t => t.status === 'pending');
                
                const overdueTasks = pendingTasks.filter(t => isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)));
                const activePending = pendingTasks.filter(t => !(isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline))));

                setStats({
                    schedules: schedRes.data.length,
                    pendingTasks: pendingTasks.length,
                    exams: examRes.data.length
                });

                // Prepare chart data
                const cData = [
                    { name: 'Selesai', value: completedTasks.length, color: '#22c55e' },
                    { name: 'Pending', value: activePending.length, color: '#f59e0b' },
                    { name: 'Terlewat', value: overdueTasks.length, color: '#ef4444' }
                ].filter(item => item.value > 0);
                
                setChartData(cData.length > 0 ? cData : [{ name: 'Belum ada tugas', value: 1, color: '#cbd5e1' }]);

                // Sort pending tasks by deadline
                const sortedPending = pendingTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                setUpcomingTasks(sortedPending.slice(0, 3));
            } catch (err) {
                console.error('Error fetching dashboard data');
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Mata Kuliah', value: stats.schedules, icon: <BookOpen size={24} />, color: 'from-blue-500 to-cyan-500' },
        { title: 'Tugas Pending', value: stats.pendingTasks, icon: <CheckSquare size={24} />, color: 'from-orange-500 to-amber-500' },
        { title: 'Jadwal Ujian', value: stats.exams, icon: <Calendar size={24} />, color: 'from-purple-500 to-pink-500' }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Halo, {user?.name}! 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Ini adalah ringkasan aktivitas akademik kamu hari ini.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="card p-6 flex items-center gap-4 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="text-primary-500" /> Deadline Terdekat
                        </h2>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        {upcomingTasks.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingTasks.map(task => {
                                    const overdue = isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline));
                                    return (
                                    <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${overdue ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                                                {overdue && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                                                        TERLEWAT
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{task.subject}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${overdue ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                                                {format(new Date(task.deadline), 'dd MMM yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                    <CheckSquare size={24} />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">Tidak ada tugas yang mendesak. Santai dulu! ☕</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon className="text-accent-500" /> Statistik Tugas
                        </h2>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
