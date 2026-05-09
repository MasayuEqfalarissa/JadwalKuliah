import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { CheckSquare, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '', subject: '', deadline: '', status: 'pending'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (err) {
            toast.error('Gagal mengambil tugas');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/assignments/${editingId}`, formData);
                toast.success('Tugas diperbarui');
            } else {
                await api.post('/assignments', formData);
                toast.success('Tugas ditambahkan');
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', subject: '', deadline: '', status: 'pending' });
            fetchAssignments();
        } catch (err) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleEdit = (assignment) => {
        setFormData(assignment);
        setEditingId(assignment.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus tugas ini?')) {
            try {
                await api.delete(`/assignments/${id}`);
                toast.success('Tugas dihapus');
                fetchAssignments();
            } catch (err) {
                toast.error('Gagal menghapus tugas');
            }
        }
    };

    const toggleStatus = async (assignment) => {
        try {
            const newStatus = assignment.status === 'completed' ? 'pending' : 'completed';
            await api.put(`/assignments/${assignment.id}`, { ...assignment, status: newStatus });
            toast.success(newStatus === 'completed' ? 'Tugas Selesai!' : 'Tugas dibatalkan');
            fetchAssignments();
        } catch (err) {
            toast.error('Gagal update status');
        }
    };

    const getDeadlineColor = (date, status) => {
        if (status === 'completed') return 'text-green-500 bg-green-50 dark:bg-green-500/10';
        if (isPast(new Date(date)) && !isToday(new Date(date))) return 'text-red-500 bg-red-50 dark:bg-red-500/10';
        if (isToday(new Date(date))) return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10';
        return 'text-primary-500 bg-primary-50 dark:bg-primary-500/10';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CheckSquare className="text-primary-500" /> Tugas & Project
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Jangan sampai ada tugas yang terlewat.</p>
                </div>
                <button onClick={() => { setIsModalOpen(true); setEditingId(null); }} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Tambah Tugas
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map(assignment => {
                    const overdue = isPast(new Date(assignment.deadline)) && !isToday(new Date(assignment.deadline)) && assignment.status !== 'completed';
                    
                    return (
                    <div key={assignment.id} className={`card p-5 border-l-4 transition-all duration-300 ${assignment.status === 'completed' ? 'border-green-500 opacity-75' : (overdue ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : 'border-orange-500')}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`text-lg font-bold text-slate-900 dark:text-white ${assignment.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                        {assignment.title}
                                    </h3>
                                    {overdue && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                                            TERLEWAT
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{assignment.subject}</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getDeadlineColor(assignment.deadline, assignment.status)}`}>
                                    <AlertCircle size={14} />
                                    {format(new Date(assignment.deadline), 'dd MMM yyyy, HH:mm')}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <button 
                                    onClick={() => toggleStatus(assignment)}
                                    className={`p-2 rounded-full transition-colors ${assignment.status === 'completed' ? 'text-green-500 bg-green-50 dark:bg-green-500/20' : 'text-slate-400 hover:text-green-500 bg-slate-100 dark:bg-slate-800'}`}
                                >
                                    <CheckCircle2 size={24} />
                                </button>
                                <div className="flex gap-1 mt-2">
                                    <button onClick={() => handleEdit(assignment)} className="p-1.5 text-slate-400 hover:text-primary-500"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(assignment.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
                
                {assignments.length === 0 && (
                    <div className="col-span-full card p-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <CheckSquare size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Belum ada tugas</h3>
                        <p className="text-slate-500 dark:text-slate-400">Klik "Tambah Tugas" untuk mulai mencatat deadline.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Tugas' : 'Tambah Tugas'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Tugas</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="Misal: Makalah BAB 1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-field" placeholder="Nama mata kuliah" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                                <input type="datetime-local" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="input-field" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Batal</button>
                                <button type="submit" className="flex-1 btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
