import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePic: '',
    securityQuestion: '',
    securityAnswer: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || '', 
        email: user.email || '', 
        phone: user.phone || '', 
        profilePic: user.profilePic || '',
        securityQuestion: user.securityQuestion || '',
        securityAnswer: user.securityAnswer || '',
        password: '' 
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5001/api/users/profile', formData, config);
      
      // Update global context so changes stick immediately
      updateUser(data);
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This will permanently delete your account and all your data. This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete('http://localhost:5001/api/users/profile', config);
        logout();
        navigate('/login');
      } catch (error) {
        alert('Error deleting account: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Settings</h2>
        <p className="text-gray-400">Manage your account preferences and platform configurations.</p>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {message}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-600/30 shadow-[0_0_30px_rgba(79,70,229,0.3)] bg-slate-800 flex items-center justify-center">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-indigo-400">{formData.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-2 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500 transition-all shadow-lg border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Change Profile Photo</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Display Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Update your name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Update your email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Add your phone number" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide text-indigo-400">Security Question</label>
                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 mb-2">
                  <option value="" disabled>Select a question</option>
                  <option value="What is your favorite food?">What is your favorite food?</option>
                  <option value="Who is your favorite hero?">Who is your favorite hero?</option>
                  <option value="What is your favorite color?">What is your favorite color?</option>
                  <option value="What was your age on your last birthday?">What was your age on your last birthday?</option>
                  <option value="What is your date of birth? (DD/MM/YYYY)">What is your date of birth? (DD/MM/YYYY)</option>
                  <option value="What is your secondary phone number?">What is your secondary phone number?</option>
                  <option value="What is your favorite place?">What is your favorite place?</option>
                  <option value="What is your favorite animal?">What is your favorite animal?</option>
                </select>
                <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleChange} placeholder="Security Answer" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">App Appearance</h3>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
                  {theme === 'dark' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-white font-medium">Display Mode</p>
                  <p className="text-sm text-gray-400">Switch between dark and light themes.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={toggleTheme}
                className="relative inline-flex items-center h-8 w-16 rounded-full bg-slate-800 transition-colors focus:outline-none border border-white/10"
              >
                <span className="sr-only">Toggle theme</span>
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-9 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.8)]' : 'translate-x-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  } inline-block h-6 w-6 transform rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center`}
                >
                   {theme === 'dark' ? <MoonIcon className="w-4 h-4 text-white" /> : <SunIcon className="w-4 h-4 text-white" />}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Notifications</h3>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive updates about new events and approvals.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all cursor-pointer">
              Save Changes
            </button>
          </div>

          {user && user.role === 'Participant' && (
            <div className="pt-10 mt-10 border-t border-red-500/20">
              <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h3>
              <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">Delete Account</p>
                  <p className="text-sm text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
                <button 
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                >
                  DELETE ACCOUNT
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
