import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? 'http://10.1.40.188:5001/api' : '/api');

const Analytics = ({ events = [] }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/users/analytics`, config);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAnalytics();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Analytics</h2>
        <p className="text-gray-400">Detailed insights into your event performance and user engagement.</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading analytics...</div>
      ) : stats ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {stats.role === 'Participant' ? (
            <>
              <div className="rounded-3xl bg-indigo-900/40 backdrop-blur-2xl border border-indigo-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2">Total Registrations</p>
                <p className="text-5xl font-black text-white">{stats.totalRequested}</p>
              </div>
              <div className="rounded-3xl bg-emerald-900/40 backdrop-blur-2xl border border-emerald-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-emerald-300 font-bold uppercase tracking-widest text-sm mb-2">Approved</p>
                <p className="text-5xl font-black text-white">{stats.approved}</p>
              </div>
              <div className="rounded-3xl bg-red-900/40 backdrop-blur-2xl border border-red-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-red-300 font-bold uppercase tracking-widest text-sm mb-2">Rejected</p>
                <p className="text-5xl font-black text-white">{stats.rejected}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-3xl bg-indigo-900/40 backdrop-blur-2xl border border-indigo-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2">Events Created</p>
                <p className="text-5xl font-black text-white">{stats.totalEventsCreated}</p>
              </div>
              <div className="rounded-3xl bg-purple-900/40 backdrop-blur-2xl border border-purple-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-purple-300 font-bold uppercase tracking-widest text-sm mb-2">Total Participants</p>
                <p className="text-5xl font-black text-white">{stats.totalParticipants}</p>
              </div>
              <div className="rounded-3xl bg-amber-900/40 backdrop-blur-2xl border border-amber-500/30 p-8 flex flex-col justify-center shadow-xl">
                <p className="text-amber-300 font-bold uppercase tracking-widest text-sm mb-2">Pending Approvals</p>
                <p className="text-5xl font-black text-white">{stats.totalPendingRequests}</p>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <div className="text-center text-red-400">Failed to load analytics data.</div>
      )}

      {/* Detailed Participation List for Admins */}
      {user?.role !== 'Participant' && events && (
        <div className="mt-16 border-t border-white/10 pt-10">
          <h3 className="text-3xl font-black text-white mb-8 flex items-center">
            <ArrowTrendingUpIcon className="w-8 h-8 text-emerald-400 mr-3" /> Detailed Participation Breakdown
          </h3>
          {events.filter(e => e.organizer?._id === user?._id || e.organizer === user?._id).length === 0 ? (
            <p className="text-gray-400 text-center py-6 bg-black/20 rounded-xl">You have no events to analyze.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {events.filter(e => e.organizer?._id === user?._id || e.organizer === user?._id).map(event => {
                const breakdown = { total: event.participants.length, subEvents: {} };
                event.participants.forEach(p => {
                  const sub = p.subEventTitle || 'Main Event Only';
                  const subSub = p.subSubEventTitle || '';
                  
                  if (!breakdown.subEvents[sub]) breakdown.subEvents[sub] = { total: 0, subSubEvents: {}, participants: [] };
                  breakdown.subEvents[sub].total += 1;
                  breakdown.subEvents[sub].participants.push(p);

                  if (subSub) {
                    if (!breakdown.subEvents[sub].subSubEvents[subSub]) breakdown.subEvents[sub].subSubEvents[subSub] = { total: 0, participants: [] };
                    breakdown.subEvents[sub].subSubEvents[subSub].total += 1;
                    breakdown.subEvents[sub].subSubEvents[subSub].participants.push(p);
                  }
                });

                return (
                  <div key={event._id} className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h4 className="font-black text-2xl text-white">{event.title}</h4>
                      <span className="text-sm font-black bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full">
                        {breakdown.total} Total
                      </span>
                    </div>
                    {breakdown.total === 0 ? (
                      <p className="text-sm text-gray-500 italic">No participants yet.</p>
                    ) : (
                      <div className="space-y-6">
                        {Object.keys(breakdown.subEvents).map(subTitle => (
                          <div key={subTitle} className="bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-lg font-bold text-gray-200">{subTitle}</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                                {breakdown.subEvents[subTitle].total} Users
                              </span>
                            </div>
                            
                            {/* List Users for this Sub-Event directly if no sub-sub events */}
                            {Object.keys(breakdown.subEvents[subTitle].subSubEvents).length === 0 ? (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {breakdown.subEvents[subTitle].participants.map(p => (
                                  <span key={p._id} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/10">
                                    {p.user?.name || 'Unknown User'} 
                                    {p.user?.phone && <span className="text-gray-400 ml-1 opacity-70">| 📞 {p.user.phone}</span>}
                                    <span className={`ml-1 ${p.status === 'Approved' ? 'text-emerald-400' : p.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                                      ({p.status})
                                    </span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-4 space-y-4">
                                {/* Users who only selected the sub-event */}
                                {breakdown.subEvents[subTitle].participants.filter(p => !p.subSubEventTitle).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs text-gray-500 font-bold uppercase mr-2 mt-1">General:</span>
                                    {breakdown.subEvents[subTitle].participants.filter(p => !p.subSubEventTitle).map(p => (
                                      <span key={p._id} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/10">
                                        {p.user?.name || 'Unknown User'}
                                        <span className={`ml-1 ${p.status === 'Approved' ? 'text-emerald-400' : p.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                                          ({p.status})
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="pl-4 border-l-2 border-indigo-500/30 space-y-4">
                                  {Object.keys(breakdown.subEvents[subTitle].subSubEvents).map(ssTitle => (
                                    <div key={ssTitle} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                      <div className="flex justify-between items-center text-sm font-bold text-gray-300 mb-2">
                                        <span>↳ {ssTitle}</span>
                                        <span className="text-indigo-400">{breakdown.subEvents[subTitle].subSubEvents[ssTitle].total}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {breakdown.subEvents[subTitle].subSubEvents[ssTitle].participants.map(p => (
                                          <span key={p._id} className="text-[10px] font-medium bg-black/40 text-gray-300 px-2 py-1 rounded border border-white/5">
                                            {p.user?.name || 'Unknown User'}
                                            {p.user?.phone && <span className="text-gray-500 ml-1 opacity-70">| 📞 {p.user.phone}</span>}
                                            <span className={`ml-1 ${p.status === 'Approved' ? 'text-emerald-400' : p.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                                              ({p.status})
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
