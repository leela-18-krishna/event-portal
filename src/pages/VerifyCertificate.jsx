import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckBadgeIcon, ExclamationTriangleIcon, AcademicCapIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const VerifyCertificate = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${API_URL}/events/verify/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification Failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-10 text-center">
          <Link to="/" className="inline-block mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 font-black tracking-tighter hover:bg-white/10 transition-all">
              <span className="text-xl">EVENT PORTAL</span>
            </div>
          </Link>

          {loading ? (
            <div className="space-y-4 py-10">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Authenticating ID...</p>
            </div>
          ) : error ? (
            <div className="py-10 space-y-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Invalid Certificate</h2>
                <p className="text-gray-400 text-sm px-10">{error}</p>
              </div>
              <Link to="/" className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all">
                Return to Portal
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
              >
                <CheckBadgeIcon className="w-14 h-14 text-emerald-500" />
              </motion.div>

              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20">
                  Verified Authentic
                </span>
                <h2 className="text-3xl font-black text-white mt-6 mb-2 tracking-tight">Certification Record</h2>
                <p className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-4 py-1 rounded-lg border border-indigo-500/20 inline-block">
                  {id}
                </p>
              </div>

              <div className="bg-black/20 rounded-3xl p-8 border border-white/5 space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Recipient</p>
                    <p className="text-xl font-bold text-white leading-tight">{data.user.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Event</p>
                    <p className="text-lg font-bold text-gray-200">{data.event.title}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Venue</p>
                    <p className="text-sm font-bold text-gray-400">{data.event.venue}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                  Verified on {new Date().toLocaleDateString()} via Event Portal Security Node
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyCertificate;
