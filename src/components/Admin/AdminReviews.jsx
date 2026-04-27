import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const AdminReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/events/all-reviews`, config);
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchReviews();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Participant Reviews</h2>
        <p className="text-gray-400">See what participants are saying about your events.</p>
      </header>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl text-center text-gray-400">
          No reviews have been submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden border border-white/10">
                    {review.user?.profilePic ? (
                      <img src={review.user.profilePic} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{review.user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{review.user?.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{review.eventTitle}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm italic line-clamp-3">"{review.comment}"</p>
              <p className="text-[10px] text-gray-500 mt-4 font-medium uppercase tracking-tighter">
                Submitted on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
