import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? `http://${window.location.hostname}:5002/api` : '/api');

const SOSPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ bloodGroup: '', hospital: '', urgency: 'Urgent', contact: '' });

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleSOS = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/emergency/request`, {
        bloodGroup: formData.bloodGroup,
        hospitalName: formData.hospital,
        urgency: formData.urgency,
        contactPhone: formData.contact,
        location: { type: 'Point', coordinates: [78.4867, 17.3850] }
      }, config);
      setStep(3);
    } catch (err) {
      setError('TRANSMISSION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="compact-card w-full max-w-[360px]"
      >
        <header className="mb-6 text-center border-b border-white/5 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ExclamationTriangleIcon className="icon-md text-primary animate-pulse" />
            <h2 className="text-xl font-black text-white uppercase italic">SOS Signal</h2>
          </div>
          <p className="text-[7px] text-text-dim uppercase tracking-widest font-bold">Priority Emergency Broadcast</p>
        </header>

        {error && (
          <div className="mb-4 text-center text-primary text-[8px] font-black tracking-widest">{error}</div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" className="space-y-6">
              <div className="grid grid-cols-4 gap-1.5">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setFormData({...formData, bloodGroup: bg})}
                    className={`py-2 rounded-md text-[9px] font-black transition-all ${
                      formData.bloodGroup === bg ? 'bg-primary text-white' : 'bg-white/2 text-text-dim border border-white/5'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-text-dim" />
                  <input 
                    type="text" 
                    placeholder="HOSPITAL NAME" 
                    className="w-full bg-white/2 border border-white/5 rounded-lg py-2.5 pl-9 text-[9px] text-white focus:outline-none focus:border-primary/20"
                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-text-dim" />
                  <input 
                    type="tel" 
                    placeholder="CONTACT PHONE" 
                    className="w-full bg-white/2 border border-white/5 rounded-lg py-2.5 pl-9 text-[9px] text-white focus:outline-none focus:border-primary/20"
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
              </div>

              <button 
                disabled={!formData.bloodGroup || !formData.hospital || !formData.contact}
                onClick={() => setStep(2)}
                className="w-full btn-mini text-[9px]"
              >
                PREPARE SIGNAL
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" className="text-center space-y-6 py-4">
              <p className="text-[10px] text-text-dim leading-relaxed">
                TRANSMIT <span className="text-primary font-black">{formData.bloodGroup}</span> ALERT TO ALL NEARBY DONORS?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2 text-[8px] font-bold text-text-dim uppercase">Edit</button>
                <button onClick={handleSOS} className="flex-[2] btn-mini">{loading ? 'T-MINUS...' : 'EXECUTE'}</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" className="text-center space-y-6 py-4">
              <div className="w-12 h-12 bg-accent/5 border border-accent/20 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircleIcon className="icon-md text-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white italic">Signal Live</h3>
                <p className="text-[7px] text-text-dim uppercase tracking-widest font-bold">Broadcast Successful</p>
              </div>
              <button onClick={() => setStep(1)} className="w-full py-2 text-[8px] font-bold text-text-dim border border-white/5 rounded-lg">Return</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SOSPage;
