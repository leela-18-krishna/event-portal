import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const Approvals = () => {
  const { user } = useAuth();
  const [eventsWithPending, setEventsWithPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchApprovals = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/events/approvals`, config);
      setEventsWithPending(data.filter(e => e.participants.length > 0)); // Only events that have participants
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchApprovals();
  }, [user]);

  const handleStatusUpdate = async (eventId, userId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/events/${eventId}/status/${userId}`, { status }, config);
      setMessage(`Participant ${status.toLowerCase()}!`);
      fetchApprovals();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error updating participant status`);
    }
  };

  const handleRemove = async (eventId, userId) => {
    if (!window.confirm("Are you sure you want to completely remove this participant's history from the event?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/events/${eventId}/participant/${userId}`, config);
      setMessage('Participant removed from history.');
      fetchApprovals();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error removing participant');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Approvals History</h2>
        <p className="text-gray-400">Review and manage participation requests for your events.</p>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading requests...</div>
      ) : eventsWithPending.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl text-center text-gray-400">
          No participation requests found for your events.
        </div>
      ) : (
        <div className="space-y-8">
          {eventsWithPending.map(event => {
            const participants = event.participants;
            const pendingCount = participants.filter(p => p.status === 'Pending').length;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={event._id} 
                className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">{event.title} <span className="text-sm font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full ml-4">{pendingCount} Pending</span></h3>
                
                <div className="space-y-4 mt-6">
                  {participants
                    .sort((a, b) => {
                      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                      return 0;
                    })
                    .map(p => {
                    let statusColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
                    if (p.status === 'Approved') statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                    if (p.status === 'Rejected') statusColor = 'text-red-400 border-red-500/30 bg-red-500/10';

                    const eventPath = [p.subEventTitle, p.subSubEventTitle].filter(Boolean).join(' ➞ ');

                    return (
                      <div key={p.user._id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-bold flex items-center">
                            {p.user.name}
                            <span className={`ml-3 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border rounded-md ${statusColor}`}>
                              {p.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {p.user.email} {p.user.phone && <span className="text-gray-500 ml-2">| 📞 {p.user.phone}</span>}
                          </p>
                          {eventPath && (
                            <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                              Path: {eventPath}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          {p.status !== 'Approved' && (
                            <button 
                              onClick={() => handleStatusUpdate(event._id, p.user._id, 'Approved')}
                              className="px-4 py-2 text-sm rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {p.status !== 'Rejected' && (
                            <button 
                              onClick={() => handleStatusUpdate(event._id, p.user._id, 'Rejected')}
                              className="px-4 py-2 text-sm rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button 
                            onClick={() => handleRemove(event._id, p.user._id)}
                            className="px-4 py-2 text-sm rounded-xl border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white font-bold transition-all cursor-pointer"
                            title="Completely remove registration record"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Approvals;
