import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Settings as SettingsIcon, User, Moon, Sun, Lock, Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            updateUser({ profile_picture: res.data.profile_picture });
            toast.success('Foto profil berhasil diubah!');
        } catch (err) {
            toast.error('Gagal mengupload foto profil');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <SettingsIcon className="text-primary-500" /> Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Atur preferensi akun dan tampilan aplikasi.</p>
            </div>

            <div className="card p-6 md:p-8 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <User size={20} className="text-primary-500" /> Profil Pengguna
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                                {user?.profile_picture ? (
                                    <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:5000${user.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-slate-900 hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                {uploading ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageChange} 
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pilih foto persegi untuk hasil terbaik. Maksimal ukuran file 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                            <input type="text" value={user?.name || ''} disabled className="input-field bg-slate-50 dark:bg-slate-800/50 text-slate-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" value={user?.email || ''} disabled className="input-field bg-slate-50 dark:bg-slate-800/50 text-slate-500" />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Moon size={20} className="text-accent-500" /> Tampilan
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Dark Mode</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Gunakan tema gelap untuk aplikasi.</p>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${darkMode ? 'bg-accent-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Lock size={20} className="text-orange-500" /> Keamanan
                    </h2>
                    <button className="btn-secondary">Ganti Password</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
