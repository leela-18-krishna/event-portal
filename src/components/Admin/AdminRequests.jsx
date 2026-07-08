import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const AdminRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/users/admin-requests`, config);
      setRequests(data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load admin requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/users/admin-requests/${id}/approve`, {}, config);
      setMessage('Request approved. The user has been notified by email.');
      fetchRequests();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not approve request');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this admin access request?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_URL}/users/admin-requests/${id}/reject`, {}, config);
      setMessage('Request rejected. The user has been notified by email.');
      fetchRequests();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not reject request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Admin Access Requests</h2>
        <p className="text-gray-400">Review and approve or reject users requesting Admin privileges.</p>
      </header>

      {message && (
        <div className="mb-6 p-4 rounded-xl text-sm font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {message}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      >
        {loading ? (
          <p className="text-gray-400 text-center py-6">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No pending admin requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">{req.name}</p>
                  <p className="text-sm text-gray-400">{req.email}</p>
                  {req.phone && <p className="text-xs text-gray-500">{req.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all font-bold text-sm"
                  >
                    <CheckIcon className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminRequests;
