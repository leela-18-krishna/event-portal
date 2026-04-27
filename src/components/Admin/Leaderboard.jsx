import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events/leaderboard`);
      setTopUsers(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest mb-4">
          <TrophyIcon className="w-4 h-4" />
          Global Hall of Fame
        </div>
        <h2 className="text-5xl font-black text-white tracking-tight mb-4">Top Participants</h2>
        <p className="text-gray-400">The most active and highly-rated users in the Event Portal ecosystem.</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-400">Crunching the numbers...</div>
      ) : (
        <div className="space-y-4">
          {topUsers.map((u, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className={`flex items-center gap-6 p-6 rounded-3xl backdrop-blur-xl border transition-all ${
                idx === 0 
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
                  : idx === 1 
                    ? 'bg-slate-400/10 border-slate-400/30' 
                    : idx === 2 
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-slate-900/40 border-white/10'
              }`}
            >
              <div className="text-2xl font-black text-gray-500 w-8">#{idx + 1}</div>
              
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-white/10">
                  {u.profilePic ? (
                    <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xl font-bold">{u.name.charAt(0)}</span>
                  )}
                </div>
                {idx < 3 && (
                  <div className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-white/20">
                    <TrophyIcon className={`w-4 h-4 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-400' : 'text-orange-500'}`} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-white tracking-tight">{u.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <StarIcon className="w-3 h-3 text-amber-500" />
                    Verified Participant
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Total Points</p>
                <p className={`text-3xl font-black ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>
                  {u.points.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
