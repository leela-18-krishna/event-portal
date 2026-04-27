import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  FlagIcon, 
  TruckIcon, 
  CheckCircleIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

const HeroTracker = ({ mission }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('En-Route');

  // Simulate real-time movement for the demo
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setStatus('Arrived');
          return 100;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-l-4 border-l-accent overflow-hidden relative"
      >
        {/* Dynamic Map Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-accent/20 w-full">
          <motion.div 
            className="h-full bg-accent shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <header className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Mission in Progress</h3>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live Tracking Active
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-accent">{100 - progress}%</span>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Remaining Dist.</p>
          </div>
        </header>

        {/* Visual Navigation Path */}
        <div className="relative h-20 flex items-center justify-between mb-10 px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <MapPinIcon className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-[8px] font-black uppercase mt-2 text-text-muted">Donor Base</p>
          </div>

          <motion.div 
            style={{ left: `${progress}%` }}
            className="absolute z-20 flex flex-col items-center -translate-x-1/2"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-[8px] font-black uppercase mt-2 text-primary tracking-widest">In-Transit</p>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 pulse-emergency">
              <FlagIcon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[8px] font-black uppercase mt-2 text-primary">Hospital</p>
          </div>
        </div>

        {/* Hero & Mission Details */}
        <div className="grid grid-cols-2 gap-6 bg-black/20 rounded-3xl p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="text-[8px] uppercase font-black text-text-muted tracking-widest">Hero Name</p>
              <p className="text-sm font-bold text-white">Rahul K. (O-)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-[8px] uppercase font-black text-text-muted tracking-widest">Contact</p>
              <p className="text-sm font-bold text-white">+91 98XXX XXX01</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <InformationCircleIcon className="w-4 h-4" />
            Mission Intel
          </button>
          <button className="flex-[2] py-4 rounded-2xl bg-accent text-white text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
            {status === 'Arrived' ? 'MISSION SUCCESS' : 'CALL HERO'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Internal Import for Demo
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default HeroTracker;
