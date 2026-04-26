import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon, 
  CalendarIcon, 
  MapPinIcon, 
  StarIcon as StarOutline,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  AcademicCapIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import RatingBlast from '../Effects/RatingBlast';
import EventAssets from './EventAssets';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? 'http://10.1.40.188:5001/api' : '/api');

const EventCard = ({ event, onWithdraw, onEdit, onDelete, myRegistration }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [selectedSubEventIdx, setSelectedSubEventIdx] = useState('');
  const [selectedSubSubEventIdx, setSelectedSubSubEventIdx] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [blastTrigger, setBlastTrigger] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(event.reviews?.some(r => r.user === user?._id || r.user?._id === user?._id));
  
  // Robustly find current user's registration
  const currentReg = myRegistration || event.participants?.find(p => {
    const pId = p.user?._id || p.user?.id || p.user;
    const uId = user?._id || user?.id;
    return pId && uId && pId.toString() === uId.toString();
  });

  // New States for Premium Features
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [assetModal, setAssetModal] = useState({ show: false, type: 'ticket' });
  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!showChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/events/${event._id}/discussions`, config);
      setMessages(data);
    } catch (error) { console.error('Chat error'); }
  };

  useEffect(() => {
    if (showChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat]);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, showChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/events/${event._id}/discussions`, { message: newMessage }, config);
      setNewMessage('');
      fetchMessages();
    } catch (error) { setStatus('Error sending message'); }
  };

  const addToCalendar = () => {
    const start = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = event.endDate ? new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "") : start;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, '_blank');
  };

  const handleParticipate = async () => {
    setStatus('loading');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let subEventTitle = '';
      let subSubEventTitle = '';
      if (selectedSubEventIdx !== '' && event.subEvents[selectedSubEventIdx]) {
        subEventTitle = event.subEvents[selectedSubEventIdx].title;
        if (selectedSubSubEventIdx !== '' && event.subEvents[selectedSubEventIdx].subSubEvents?.[selectedSubSubEventIdx]) {
          subSubEventTitle = event.subEvents[selectedSubEventIdx].subSubEvents[selectedSubSubEventIdx].title;
        }
      }
      const res = await axios.post(`${API_URL}/events/${event._id}/register`, { subEventTitle, subSubEventTitle }, config);
      setStatus(res.data.message);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Error joining event');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleReviewSubmit = async () => {
    if (userRating === 0) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/events/${event._id}/reviews`, { rating: userRating, comment }, config);
      setReviewSubmitted(true);
      setBlastTrigger(prev => prev + 1);
      setStatus('Review submitted!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Error submitting review');
    }
  };

  const categoryStyles = {
    Technology: 'from-blue-600/20 to-indigo-600/20',
    Sports: 'from-orange-600/20 to-red-600/20',
    Music: 'from-purple-600/20 to-pink-600/20',
    Arts: 'from-emerald-600/20 to-teal-600/20',
    Business: 'from-slate-600/20 to-gray-600/20',
    Other: 'from-rose-600/20 to-amber-600/20'
  };

  return (
    <motion.div 
      layout
      className="relative flex flex-col h-full p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-500 group overflow-hidden"
    >
      {event.imageUrl && (
        <div className="absolute top-0 left-0 w-full h-40 opacity-40 group-hover:opacity-60 transition-opacity">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
      )}
      <RatingBlast rating={userRating} trigger={blastTrigger} />
      <EventAssets 
        show={assetModal.show} 
        type={assetModal.type} 
        event={event} 
        user={user} 
        currentReg={currentReg}
        onClose={() => setAssetModal({ ...assetModal, show: false })} 
      />
      
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryStyles[event.category] || categoryStyles.Other} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-900/40 rounded-full border border-indigo-500/30">
            {event.category}
          </span>
          <div className="flex gap-2">
            {!onWithdraw && !onEdit && user?.role === 'Participant' && new Date(event.date) >= new Date() && (
              <button onClick={() => addToCart(event)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all" title="Add to Interest">
                <BookmarkIcon className="w-5 h-5 text-gray-300" />
              </button>
            )}
            {myRegistration?.status === 'Approved' && (
              <button onClick={addToCalendar} className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all" title="Add to Calendar">
                <CalendarIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{event.title}</h3>
        <p className="text-sm text-gray-400 mb-6 line-clamp-2">{event.description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-300">
            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="text-xs font-bold">{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <MapPinIcon className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="text-xs truncate">{event.venue}</span>
          </div>
        </div>

        {/* Interaction Bar for Participants (Approved Only) & Admin (Oversight Only) */}
        {user?.role !== 'Participant' ? (
          <div className="mb-6">
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${showChat ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Event Oversight Chat</span>
            </button>
          </div>
        ) : currentReg?.status === 'Approved' && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button 
              onClick={() => setAssetModal({ show: true, type: 'ticket' })}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-400 transition-all text-indigo-400"
            >
              <TicketIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-black uppercase">Ticket</span>
            </button>
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${showChat ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-black uppercase">Chat</span>
            </button>
            <button 
              onClick={() => setAssetModal({ show: true, type: 'certificate' })}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                (user?.role !== 'Participant' || new Date(event.date) <= new Date())
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'opacity-30 cursor-not-allowed bg-gray-500/10 border border-gray-500/20 text-gray-500'
              }`}
              disabled={user?.role === 'Participant' && new Date(event.date) > new Date()}
              title={user?.role === 'Participant' && new Date(event.date) > new Date() ? 'Available once the event starts' : 'Download Certificate'}
            >
              <AcademicCapIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-black uppercase">Award</span>
            </button>
          </div>
        )}

        {/* Discussion / Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex flex-col h-64"
            >
              <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-10 uppercase tracking-widest">Start the conversation</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.user._id === user._id ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 overflow-hidden">
                        {m.user.profilePic ? <img src={m.user.profilePic} className="w-full h-full object-cover" /> : <span className="text-[8px] text-white flex items-center justify-center h-full font-bold">{m.user.name.charAt(0)}</span>}
                      </div>
                      <div className={`max-w-[80%] p-2 rounded-xl text-[11px] ${m.user._id === user._id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                        {m.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 border-t border-white/5 flex gap-2">
                {new Date(event.endDate || event.date) < new Date() && user?.role === 'Participant' ? (
                  <div className="w-full py-2 bg-white/5 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Discussion closed for this event
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={user?.role !== 'Participant' ? "Post an official update..." : "Type a message..."}
                      className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button onClick={handleSendMessage} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Section */}
        {user?.role === 'Participant' && myRegistration?.status === 'Approved' && new Date(event.date) <= new Date() && !reviewSubmitted && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3 mb-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rate this experience</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setUserRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                  {star <= (hoverRating || userRating) ? <StarSolid className="w-6 h-6 text-amber-400" /> : <StarOutline className="w-6 h-6 text-gray-600" />}
                </button>
              ))}
            </div>
            <button onClick={handleReviewSubmit} disabled={userRating === 0} className="w-full py-2 bg-indigo-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30">Submit Review</button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Prize Pool</p>
            <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              ₹{event.prizeMoneyPool?.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end">
            {user?.role === 'Participant' ? (
              <div className="flex space-x-2">
                {onWithdraw ? (
                  new Date(event.date) > new Date() ? (
                    <button onClick={() => onWithdraw(event._id)} className="px-5 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all">Withdraw</button>
                  ) : (
                    <span className="px-5 py-2.5 text-sm font-black text-gray-600 bg-gray-900/40 border border-white/5 rounded-xl cursor-not-allowed uppercase tracking-widest">Locked</span>
                  )
                ) : new Date(event.date) < new Date() ? (
                  <span className="px-5 py-2.5 text-sm font-bold text-gray-500 bg-gray-500/10 border border-gray-500/20 rounded-xl cursor-not-allowed">Closed</span>
                ) : (
                  <button onClick={handleParticipate} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all">Participate</button>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white">Edit</button>
                {onDelete && <button onClick={onDelete} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">Delete</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
