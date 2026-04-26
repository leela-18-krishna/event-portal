import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? 'http://10.1.40.188:5001/api' : '/api');

const Login = () => {
  const [view, setView] = useState('login'); // login, signup, forgot, reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Participant');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'signup') {
      fetchRandomQuestion();
    }
  }, [view]);

  const fetchRandomQuestion = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/random-question`);
      setSecurityQuestion(data.question);
    } catch (err) {
      console.error("Failed to fetch security question");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (view === 'login') {
      const res = await login(email, password);
      if (res.success) navigate('/');
      else setError(res.message);
    } 
    else if (view === 'signup') {
      try {
        const res = await axios.post(`${API_URL}/auth/register`, { 
          name, email, password, role, securityQuestion, securityAnswer 
        });
        if (res.data) {
          setMessage('Registration successful! Please login.');
          setView('login');
        } else {
          setError('Registration failed');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
    else if (view === 'forgot') {
      const res = await forgotPassword(email);
      if (res.success) {
        setSecurityQuestion(res.question);
        setView('reset');
      } else {
        setError(res.message);
      }
    }
    else if (view === 'reset') {
      const res = await resetPassword(email, securityAnswer, password);
      if (res.success) {
        setMessage('Password reset successful! Please login.');
        setView('login');
      } else {
        setError(res.message);
      }
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
              {view === 'reset' && 'Reset Password'}
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

            {(view === 'login' || view === 'signup' || view === 'forgot') && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
            )}

            {view === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide text-indigo-400">Security Question (Randomly Assigned)</label>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-100 text-sm italic mb-2">
                  {securityQuestion}
                </div>
                <input type="text" placeholder="Your Answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
            )}

            {view === 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide text-indigo-400">Security Check</label>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-100 text-sm italic mb-2">
                  {securityQuestion}
                </div>
                <input type="text" placeholder="Enter your answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
            )}

            {(view === 'login' || view === 'signup' || view === 'reset') && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{view === 'reset' ? 'New Password' : 'Password'}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all" required />
              </div>
            )}

            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 uppercase">
              {view === 'login' && 'Sign In'}
              {view === 'signup' && 'Create Account'}
              {view === 'forgot' && 'Get Security Question'}
              {view === 'reset' && 'Reset Password'}
            </button>
            
            <div className="flex flex-col gap-3 text-center mt-6">
              {view === 'login' ? (
                <>
                  <button type="button" onClick={() => setView('signup')} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">Don't have an account? Sign Up</button>
                  <button type="button" onClick={() => setView('forgot')} className="text-gray-500 hover:text-gray-400 text-xs font-medium transition-colors">Forgot Password?</button>
                </>
              ) : (
                <button type="button" onClick={() => setView('login')} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">Back to Login</button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
