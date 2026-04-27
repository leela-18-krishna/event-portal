import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  MapIcon, 
  TrophyIcon, 
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import HeroTracker from '../components/Maps/HeroTracker';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? `http://${window.location.hostname}:5002/api` : '/api');

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Explore');
  const [activeMission, setActiveMission] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/emergency/active`, config);
      setRequests(data);
    } catch (error) {
      console.error('Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Compact */}
      <aside className="w-full md:w-16 bg-surface border-r border-white/5 flex md:flex-col items-center py-4 px-2 gap-6 z-50">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-black italic text-white text-xs">L</div>
        <div className="flex flex-1 md:flex-col gap-4">
          {[MapIcon, HeartIcon, TrophyIcon, UserCircleIcon].map((Icon, i) => (
            <button key={i} className={`p-2 rounded-lg transition-all ${i === 0 ? 'bg-white/5 text-primary' : 'text-text-dim hover:text-white'}`}>
              <Icon className="icon-md" />
            </button>
          ))}
        </div>
        <BellIcon className="icon-md text-text-dim" />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <header className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Mission Radar</h2>
            <p className="text-[8px] text-text-dim uppercase tracking-[0.2em] font-bold">A-Level Response Center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/2 border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <MagnifyingGlassIcon className="icon-sm text-text-dim" />
              <input type="text" placeholder="FILTER SIGNALS..." className="bg-transparent border-none text-[8px] font-bold text-white focus:outline-none w-20" />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20" />
          </div>
        </header>

        {activeMission ? (
          <HeroTracker mission={activeMission} onComplete={() => setActiveMission(null)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-20 text-center text-[8px] font-black tracking-widest text-text-dim animate-pulse">SCANNING...</div>
            ) : requests.length === 0 ? (
              <div className="col-span-full py-20 text-center text-[8px] font-black tracking-widest text-text-dim border border-white/5 rounded-xl bg-white/1">NO SIGNALS DETECTED</div>
            ) : (
              requests.map((request) => (
                <div key={request._id} className="compact-card flex flex-col gap-4 border-l-2 border-l-primary">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded flex items-center justify-center font-black text-primary text-sm">
                      {request.bloodGroup}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest ${
                      request.urgency === 'Critical' ? 'bg-primary/20 text-primary border border-primary/20 animate-pulse' : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      {request.urgency}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-white mb-0.5">{request.hospitalName}</h3>
                    <p className="text-[8px] text-text-dim flex items-center gap-1 uppercase">
                      <MapIcon className="icon-sm" /> {request.distance || '0.5 KM'} AWAY
                    </p>
                  </div>
                  <button onClick={() => setActiveMission(request)} className="btn-mini text-[8px] w-full">Accept Mission</button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
