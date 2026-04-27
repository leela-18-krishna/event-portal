import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, UsersIcon, TicketIcon, ShoppingCartIcon, BellAlertIcon, FireIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../Events/EventCard';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) return 'Live Now!';
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return <span className="font-mono tracking-wider">{timeLeft}</span>;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const DashboardStats = ({ events = [] }) => {
  const { user } = useAuth();
  const [cartEvents, setCartEvents] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/events/cart`, config);
        setCartEvents(data);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setLoadingCart(false);
      }
    };
    if (user?.token) {
      fetchCart();
      const interval = setInterval(fetchCart, 2000); // Poll every 2s for instant updates
      return () => clearInterval(interval);
    }
  }, [user]);

  let statsData = [];
  let reminders = [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (user?.role === 'Participant') {
    statsData = [
      { id: 1, name: 'Available Events', value: events.length.toString(), icon: TicketIcon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
      { id: 2, name: 'My Registrations', value: cartEvents.length.toString(), icon: ShoppingCartIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ];

    reminders = cartEvents.filter(event => {
      const myParticipant = event.participants.find(p => p.user === user._id || (p.user && p.user._id === user._id));
      const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
      const fiveMinutesAfterEnd = new Date(endDate.getTime() + 5 * 60 * 1000);
      // Show reminder until 5 minutes after the end date
      return (myParticipant?.status === 'Approved' || myParticipant?.status === 'Pending') && fiveMinutesAfterEnd >= new Date();
    });

  } else {
    const myEvents = events.filter(e => e.organizer?._id === user?._id || e.organizer === user?._id);
    const totalRegistered = myEvents.reduce((acc, e) => acc + e.participants.length, 0);
    const totalPending = myEvents.reduce((acc, e) => acc + e.participants.filter(p => p.status === 'Pending').length, 0);

    statsData = [
      { id: 1, name: 'My Events', value: myEvents.length.toString(), icon: TicketIcon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
      { id: 2, name: 'Total Registrations', value: totalRegistered.toString(), icon: UsersIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { id: 3, name: 'Pending Requests', value: totalPending.toString(), icon: ShoppingCartIcon, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    reminders = myEvents.filter(event => {
      const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
      const fiveMinutesAfterEnd = new Date(endDate.getTime() + 5 * 60 * 1000);
      return fiveMinutesAfterEnd >= new Date();
    });
  }

  const handleWithdraw = async (eventId) => {
    if (!window.confirm("Are you sure you want to withdraw your registration history for this event?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/events/${eventId}/participant/${user._id}`, config);
      setCartEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (error) {
      alert("Failed to withdraw registration");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header>
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">My Dashboard</h2>
        <p className="text-gray-400">Overview of your event platform activity.</p>
      </header>

      {/* Reminders Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <BellAlertIcon className="w-6 h-6 text-amber-400 mr-2" /> Reminders & Countdowns
        </h3>
        
        {reminders.length === 0 ? (
          <div className="bg-slate-900/40 border border-white/5 text-gray-500 p-4 rounded-xl flex items-center shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            No upcoming events to remind you about right now.
          </div>
        ) : (
          <div className="space-y-3">
              {reminders.map(event => {
                const eventDateObj = new Date(event.date);
                const endDateObj = event.endDate ? new Date(event.endDate) : null;
                const isToday = eventDateObj.toDateString() === new Date().toDateString();
                const now = new Date();
                const hasEnded = endDateObj && now > endDateObj;
                const isLive = now >= eventDateObj && (!endDateObj || now <= endDateObj);

                return (
                  <div 
                    key={`reminder-${event._id}`} 
                    className={`p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
                      hasEnded
                        ? 'bg-emerald-500/10 border border-emerald-500/30 opacity-80'
                        : isLive
                        ? 'bg-rose-500/20 border-2 border-rose-500/50 shadow-[0_0_30_rgba(244,63,94,0.3)]'
                        : isToday 
                        ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border-2 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-pulse'
                        : 'bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                    }`}
                  >
                    <div className={`${hasEnded ? 'text-emerald-100' : isLive ? 'text-rose-100' : 'text-amber-100'} flex items-center`}>
                      {hasEnded ? <span className="text-xl mr-2">✅</span> : (isLive || isToday) && <span className="text-xl mr-2">🎉</span>}
                      <span className="font-bold mr-2">{event.title}</span> 
                      <span className="text-gray-400 mx-2">|</span>
                      <span className={`font-black ${hasEnded ? 'text-emerald-400' : isLive ? 'text-rose-400' : isToday ? 'text-amber-300' : 'text-amber-400'}`}>
                        {hasEnded ? 'Event Completed!' : isLive ? 'Live Now!' : <>Starts in: <Countdown targetDate={event.date} /></>}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                      hasEnded 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isLive 
                        ? 'bg-rose-500 text-white' 
                        : isToday 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {hasEnded ? 'Finished' : isLive ? 'Live' : eventDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <motion.div key={stat.id} variants={item} className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">{stat.name}</p>
            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Registration History for Participants */}
      {user?.role === 'Participant' && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">My Registration History</h3>
          {loadingCart ? (
             <div className="text-center text-gray-400 py-10">Loading history...</div>
          ) : cartEvents.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl text-center text-gray-400">
              You haven't requested to participate in any events yet. Go to Registrations to find events!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {cartEvents.map(event => {
                const myParticipant = event.participants.find(p => p.user === user._id || (p.user && p.user._id === user._id));
                const myStatus = myParticipant ? myParticipant.status : 'Unknown';
                let badgeColor = 'bg-amber-500/90';
                if (myStatus === 'Approved') badgeColor = 'bg-emerald-500/90';
                if (myStatus === 'Rejected') badgeColor = 'bg-red-500/90';

                return (
                  <div key={event._id} className="relative group">
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <div className={`${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md`}>
                        {myStatus}
                      </div>
                    </div>
                    <EventCard event={event} onWithdraw={handleWithdraw} myRegistration={myParticipant} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live Events List */}
      <div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-6 border-b border-white/10 pb-4 flex items-center">
          <FireIcon className="w-8 h-8 text-rose-500 mr-2" /> Live Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.filter(e => {
            const now = new Date();
            const startDate = new Date(e.date);
            const endDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
            // Live if currently happening OR if it started today and hasn't ended yet
            return now >= startDate && now <= endDate;
          }).length === 0 ? (
             <p className="text-gray-400 col-span-3 text-center py-6">No events are happening right now.</p>
          ) : (
            events.filter(e => {
              const now = new Date();
              const startDate = new Date(e.date);
              const endDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
              return now >= startDate && now <= endDate;
            }).map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </div>
      </div>

      {/* Platform Events List */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center">
          <CalendarDaysIcon className="w-8 h-8 text-indigo-400 mr-2" /> Upcoming Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.filter(e => new Date(e.date) > new Date()).length === 0 ? (
             <p className="text-gray-400 col-span-3 text-center py-6">No upcoming events right now.</p>
          ) : (
            events.filter(e => new Date(e.date) > new Date()).map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 text-gray-400 flex items-center">
          <ClockIcon className="w-8 h-8 text-gray-400 mr-2" /> Previous Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 opacity-75 grayscale-[30%]">
          {events.filter(e => {
            const now = new Date();
            const endDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
            return now > endDate;
          }).length === 0 ? (
             <p className="text-gray-400 col-span-3 text-center py-6">No previous events found.</p>
          ) : (
            events.filter(e => {
              const now = new Date();
              const endDate = e.endDate ? new Date(e.endDate) : new Date(e.date);
              return now > endDate;
            }).map(event => (
              <EventCard key={event._id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
