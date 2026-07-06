import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const PasswordInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-all"
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const Login = () => {
  const [view, setView] = useState('login'); // login, signup, forgot, reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Participant');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await login(email, password);
        if (res.success) navigate('/');
        else setError(res.message);
      }
      else if (view === 'signup') {
        try {
          const res = await axios.post(`${API_URL}/auth/register`, {
            name, email, password, role
          });
          if (res.data) {
            setMessage('Registration successful! Please login.');
            setView('login');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Registration failed');
        }
      }
      else if (view === 'forgot') {
        try {
          const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
          setMaskedEmail(data.maskedEmail);
          setMessage(`A verification code has been sent to ${data.maskedEmail}`);
          setView('reset');
        } catch (err) {
          setError(err.response?.data?.message || 'Could not send reset code');
        }
      }
      else if (view === 'reset') {
        try {
          const { data } = await axios.post(`${API_URL}/auth/reset-password`, {
            email, code: resetCode, newPassword
          });
          setMessage(data.message || 'Password reset successful! Please login.');
          setView('login');
          setResetCode('');
          setNewPassword('');
        } catch (err) {
          setError(err.response?.data?.message || 'Reset failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">EVENT</span>
              <span className="text-white font-light">PORTAL</span>
            </h1>
            <p className="text-gray-400 font-medium">
              {view === 'login' && 'Log in to your account'}
              {view === 'signup' && 'Create a new account'}
              {view === 'forgot' && 'Password Recovery'}
              {view === 'reset' && 'Enter Verification Code'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(error || message) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 border rounded-xl text-sm font-medium text-center ${error ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}
              >
                {error || message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submitHandler} className="space-y-5">
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Register As</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('Participant')}
                    className={`py-3 rounded-xl border font-bold transition-all ${role === 'Participant' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-black/20 border-white/10 text-gray-400'}`}
                  >
                    USER
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`py-3 rounded-xl border font-bold transition-all ${role === 'Admin' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-black/20 border-white/10 text-gray-400'}`}
                  >
                    ADMIN
                  </button>
                </div>
              </div>
            )}

            {view === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
            )}

            {(view === 'login' || view === 'signup' || view === 'forgot' || view === 'reset') && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  {view === 'signup' ? 'Gmail Address' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={view === 'signup' ? 'you@gmail.com' : ''}
                  disabled={view === 'reset'}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                  required
                />
                {view === 'signup' && (
                  <p className="text-xs text-gray-500 mt-1">Only @gmail.com addresses are accepted.</p>
                )}
              </div>
            )}

            {view === 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Verification Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            {(view === 'login' || view === 'signup') && (
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {view === 'reset' && (
              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            )}

            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 uppercase disabled:opacity-60">
              {loading ? 'Please wait...' : (
                <>
                  {view === 'login' && 'Sign In'}
                  {view === 'signup' && 'Create Account'}
                  {view === 'forgot' && 'Send Reset Code'}
                  {view === 'reset' && 'Reset Password'}
                </>
              )}
            </button>

            <div className="flex flex-col gap-3 text-center mt-6">
              {view === 'login' ? (
                <>
                  <button type="button" onClick={() => setView('signup')} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">Don't have an account? Sign Up</button>
                  <button type="button" onClick={() => setView('forgot')} className="text-gray-500 hover:text-gray-400 text-xs font-medium transition-colors">Forgot Password?</button>
                </>
              ) : (
                <button type="button" onClick={() => { setView('login'); setError(''); setMessage(''); }} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">Back to Login</button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
