import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        course_name: '', lecturer: '', room: '', day: 'Senin', start_time: '', end_time: '', color: '#3b82f6'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await api.get('/schedules');
            setSchedules(res.data);
        } catch (err) {
            toast.error('Gagal mengambil jadwal');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/schedules/${editingId}`, formData);
                toast.success('Jadwal diperbarui');
            } else {
                await api.post('/schedules', formData);
                toast.success('Jadwal ditambahkan');
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ course_name: '', lecturer: '', room: '', day: 'Senin', start_time: '', end_time: '', color: '#3b82f6' });
            fetchSchedules();
        } catch (err) {
            toast.error('Terjadi kesalahan');
        }
    };

    const handleEdit = (schedule) => {
        setFormData(schedule);
        setEditingId(schedule.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus jadwal ini?')) {
            try {
                await api.delete(`/schedules/${id}`);
                toast.success('Jadwal dihapus');
                fetchSchedules();
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
                        <Calendar className="text-primary-500" /> Jadwal Kuliah
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Atur jadwal perkuliahan mingguanmu.</p>
                </div>
                <button onClick={() => { setIsModalOpen(true); setEditingId(null); }} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Tambah Jadwal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {days.map(day => {
                    const daySchedules = schedules.filter(s => s.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                    
                    return (
                        <div key={day} className="card p-0 overflow-hidden flex flex-col h-full">
                            <div className="bg-slate-100 dark:bg-slate-800 py-3 px-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-center">
                                {day}
                            </div>
                            <div className="p-4 space-y-4 flex-1">
                                {daySchedules.length > 0 ? (
                                    daySchedules.map(schedule => (
                                        <div key={schedule.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group transition-all hover:shadow-md dark:bg-slate-800/50" style={{ borderLeftColor: schedule.color, borderLeftWidth: '4px' }}>
                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(schedule)} className="text-slate-400 hover:text-primary-500"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(schedule.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 pr-12">{schedule.course_name}</h3>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                                                <p>⏰ {schedule.start_time} - {schedule.end_time}</p>
                                                <p>📍 {schedule.room}</p>
                                                {schedule.lecturer && <p>👨‍🏫 {schedule.lecturer}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center min-h-[100px] text-sm text-slate-400 italic">
                                        Kosong
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                <input type="text" required value={formData.course_name} onChange={e => setFormData({...formData, course_name: e.target.value})} className="input-field" placeholder="Ketik nama mata kuliah" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hari</label>
                                    <select value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="input-field">
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ruangan</label>
                                    <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="input-field" placeholder="A101" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai</label>
                                    <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai</label>
                                    <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="input-field" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosen</label>
                                <input type="text" value={formData.lecturer} onChange={e => setFormData({...formData, lecturer: e.target.value})} className="input-field" placeholder="Nama Dosen" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Warna Label</label>
                                <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full h-10 rounded cursor-pointer border-0" />
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

export default Schedules;
