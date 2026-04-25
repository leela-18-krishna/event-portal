import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5001/api/events/notifications', config);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAsRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5001/api/events/notifications/read', {}, config);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read');
    }
  };

  const toggleNotifications = () => {
    if (!show && unreadCount > 0) {
      handleMarkAsRead();
    }
    setShow(!show);
  };

  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="relative p-2 rounded-xl bg-slate-900/40 border border-white/10 hover:bg-white/10 transition-all"
      >
        <BellIcon className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setShow(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white">Notifications</h3>
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Real-time</span>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-xs text-gray-500">No notifications yet.</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-500/5' : ''}`}>
                      <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-gray-600 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
