import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, HeartIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('donor'); 
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: 'password123' });
  const [error, setError] = useState('');

  const handleScanStart = async () => {
    if (!formData.email) {
      setError('ID REQUIRED');
      return;
    }
    setError('');
    setIsScanning(true);

    const scanTimer = setTimeout(async () => {
      try {
        let res;
        if (role === 'seeker') {
          res = await register({ ...formData, name: formData.name || 'Emergency Seeker', role: 'Seeker', phone: '0000000000', location: { type: 'Point', coordinates: [78.4867, 17.3850] } });
        } else {
          res = await login(formData.email, formData.password);
          if (!res.success) {
            res = await register({ ...formData, role: role.charAt(0).toUpperCase() + role.slice(1), phone: '0000000000', location: { type: 'Point', coordinates: [78.4867, 17.3850] } });
          }
        }

        if (res.success) {
          setScanComplete(true);
          setIsScanning(false);
          setTimeout(() => {
            if (role === 'seeker') navigate('/sos');
            else if (role === 'hospital') navigate('/hospital');
            else navigate('/dashboard');
          }, 1000);
        } else {
          setIsScanning(false);
          setError(res.message.toUpperCase());
        }
      } catch (err) {
        setIsScanning(false);
        setError('SERVER OFFLINE');
      }
    }, 1500);

    const handleRelease = () => {
      if (!scanComplete) {
        clearTimeout(scanTimer);
        setIsScanning(false);
        setError('SCAN ABORTED');
      }
      window.removeEventListener('mouseup', handleRelease);
    };
    window.addEventListener('mouseup', handleRelease);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="compact-card w-full max-w-[320px]"
      >
        <header className="mb-6 text-center border-b border-white/5 pb-4">
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Lifeline</h1>
          <p className="text-[7px] text-text-dim uppercase tracking-[0.4em] mt-1 font-bold">Guardian Protocol 2.0</p>
        </header>

        {error && (
          <div className="mb-4 text-center text-primary text-[8px] font-black tracking-widest">{error}</div>
        )}

        <div className="flex gap-1 mb-6 p-1 bg-white/2 rounded-lg">
          {['donor', 'hospital', 'seeker'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${
                role === r ? 'bg-primary text-white' : 'text-text-dim'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-text-dim" />
            <input 
              type="email" 
              placeholder="IDENTITY EMAIL" 
              className="w-full bg-white/2 border border-white/5 rounded-lg py-2.5 pl-9 text-[9px] text-white focus:outline-none focus:border-primary/20"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          {role !== 'seeker' && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-text-dim" />
              <input 
                type="text" 
                placeholder="FULL NAME" 
                className="w-full bg-white/2 border border-white/5 rounded-lg py-2.5 pl-9 text-[9px] text-white focus:outline-none focus:border-primary/20"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center py-2">
          <button
            onMouseDown={handleScanStart}
            className={`scan-pulse transition-all duration-500 ${scanComplete ? 'bg-accent/20 border-accent' : ''}`}
          >
            {scanComplete ? (
              <ShieldCheckIcon className="icon-md text-white" />
            ) : (
              <HeartIcon className={`icon-lg ${isScanning ? 'text-primary' : 'text-text-dim'}`} />
            )}
            
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  className="absolute inset-0 border border-primary/50 rounded-full"
                />
              )}
            </AnimatePresence>
          </button>
          <p className="mt-4 text-[7px] font-black text-text-dim uppercase tracking-widest">
            {isScanning ? 'Syncing...' : scanComplete ? 'Verified' : 'Hold to Verify'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
