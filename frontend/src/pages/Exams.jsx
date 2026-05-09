import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Plus, Edit2, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: '', exam_date: '', room: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (err) {
            toast.error('Gagal mengambil jadwal ujian');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/exams/${editingId}`, formData);
                toast.success('Jadwal ujian diperbarui');
            } else {
                await api.post('/exams', formData);
                toast.success('Jadwal ujian ditambahkan');
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ subject: '', exam_date: '', room: '' });
            fetchExams();
        } catch (err) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleEdit = (exam) => {
        setFormData(exam);
        setEditingId(exam.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (examId) => {
        if (window.confirm('Hapus jadwal ujian ini?')) {
            try {
                await api.delete(`/exams/${examId}`);
                toast.success('Jadwal dihapus');
                fetchExams();
            } catch (err) {
                toast.error('Gagal menghapus jadwal');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Clock className="text-primary-500" /> Jadwal Ujian
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Persiapkan dirimu, catat tanggalnya!</p>
                </div>
                <button onClick={() => { setIsModalOpen(true); setEditingId(null); }} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Tambah Ujian
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="card p-6 relative group overflow-hidden border-t-4 border-t-accent-500">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(exam)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 hover:text-primary-500"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(exam.id)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-16">{exam.subject}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ruangan: {exam.room}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <CalendarIcon size={16} className="text-accent-500" />
                                {format(new Date(exam.exam_date), 'EEEE, dd MMMM yyyy - HH:mm', { locale: id })}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-accent-600 dark:text-accent-400">
                                <Clock size={16} />
                                Countdown: {formatDistanceToNow(new Date(exam.exam_date), { locale: id, addSuffix: true })}
                            </div>
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="col-span-full card p-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Belum ada ujian</h3>
                        <p className="text-slate-500 dark:text-slate-400">Wah, aman! Tidak ada jadwal ujian sejauh ini.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Ujian' : 'Tambah Ujian'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-field" placeholder="Nama mata kuliah" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal & Waktu Ujian</label>
                                <input type="datetime-local" required value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ruangan</label>
                                <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="input-field" placeholder="Misal: Aula Utama" />
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

export default Exams;
