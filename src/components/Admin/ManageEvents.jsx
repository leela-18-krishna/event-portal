import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import EventCard from '../Events/EventCard';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname.includes('10.1.') ? 'http://10.1.40.188:5001/api' : '/api');

const ManageEvents = ({ onEventAdded, events = [], eventToEdit, onEditStart }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    venue: '',
    prizeMoneyPool: 0,
    contactPhone: '',
    contactEmail: '',
    category: 'Technology',
    imageUrl: '',
    subEvents: []
  });
  
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      handleEdit(eventToEdit);
      if (onEditStart) onEditStart();
    }
  }, [eventToEdit]);

  const handleSubEventChange = (index, field, value) => {
    const newSubEvents = [...formData.subEvents];
    newSubEvents[index][field] = value;
    setFormData({ ...formData, subEvents: newSubEvents });
  };

  const addSubEvent = () => {
    setFormData({
      ...formData,
      subEvents: [...formData.subEvents, { title: '', prizeMoney: 0, entryFee: 0, subSubEvents: [] }]
    });
  };

  const removeSubEvent = (index) => {
    const newSubEvents = formData.subEvents.filter((_, i) => i !== index);
    setFormData({ ...formData, subEvents: newSubEvents });
  };

  const handleSubSubEventChange = (subIndex, subSubIndex, field, value) => {
    const newSubEvents = [...formData.subEvents];
    newSubEvents[subIndex].subSubEvents[subSubIndex][field] = value;
    setFormData({ ...formData, subEvents: newSubEvents });
  };

  const addSubSubEvent = (subIndex) => {
    const newSubEvents = [...formData.subEvents];
    if (!newSubEvents[subIndex].subSubEvents) newSubEvents[subIndex].subSubEvents = [];
    newSubEvents[subIndex].subSubEvents.push({ title: '', prizeMoney: 0, entryFee: 0 });
    setFormData({ ...formData, subEvents: newSubEvents });
  };

  const removeSubSubEvent = (subIndex, subSubIndex) => {
    const newSubEvents = [...formData.subEvents];
    newSubEvents[subIndex].subSubEvents = newSubEvents[subIndex].subSubEvents.filter((_, i) => i !== subSubIndex);
    setFormData({ ...formData, subEvents: newSubEvents });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    const formattedDate = new Date(event.date).toISOString().slice(0, 16);
    const formattedEndDate = event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '';
    setFormData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      endDate: formattedEndDate,
      venue: event.venue,
      prizeMoneyPool: event.prizeMoneyPool,
      contactPhone: event.contactPhone || '',
      contactEmail: event.contactEmail || '',
      category: event.category,
      imageUrl: event.imageUrl || '',
      subEvents: event.subEvents || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      if (editingId) {
        await axios.put(`${API_URL}/events/${editingId}`, formData, config);
        setMessage('Event updated successfully!');
      } else {
        await axios.post(`${API_URL}/events`, formData, config);
        setMessage('Event created successfully!');
      }
      
      setFormData({
        title: '',
        description: '',
        date: '',
        endDate: '',
        venue: '',
        prizeMoneyPool: 0,
        contactPhone: '',
        contactEmail: '',
        category: 'Technology',
        imageUrl: '',
        subEvents: []
      });
      setEditingId(null);
      
      if(onEventAdded) onEventAdded();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || `Error ${editingId ? 'updating' : 'creating'} event`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/events/${id}`, config);
      if(onEventAdded) onEventAdded(); // Refresh events list
      if (editingId === id) {
        setEditingId(null);
        setFormData({ title: '', description: '', date: '', venue: '', prizeMoneyPool: 0, contactPhone: '', contactEmail: '', category: 'Technology', subEvents: [] });
      }
    } catch (error) {
      alert('Error deleting event: ' + (error.response?.data?.message || error.message));
    }
  };

  const userEvents = events.filter(e => e.organizer?._id === user?._id || e.organizer === user?._id || user?.role === 'SuperAdmin');

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="order-2 xl:order-1">
        <header className="mb-10 xl:mt-0 mt-12">
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">Your Events</h2>
          <p className="text-gray-400">Events you have published and manage.</p>
        </header>

        <div className="space-y-4">
          {userEvents.length === 0 ? (
            <div className="text-gray-400 p-6 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              You haven't created any events yet.
            </div>
          ) : (
            userEvents.map(event => (
              <EventCard 
                key={event._id} 
                event={event} 
                onEdit={() => handleEdit(event)}
                onDelete={() => handleDelete(event._id)}
              />
            ))
          )}
        </div>
      </div>

      <div className="order-1 xl:order-2">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">{editingId ? 'Edit Event' : 'Create Event'}</h2>
          <p className="text-gray-400">{editingId ? 'Update your event details.' : 'Create and publish new events to the platform.'}</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">{editingId ? 'Update Details' : 'Create New Event'}</h3>
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Event Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 [&>option]:bg-slate-900">
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Arts">Arts</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Event Banner URL (Optional)</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/poster.jpg" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 mb-6" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Start Date & Time</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">End Date & Time</label>
                <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.date || new Date().toISOString().slice(0, 16)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Total Prize Pool (₹)</label>
                <input type="number" name="prizeMoneyPool" value={formData.prizeMoneyPool} onChange={handleChange} min="0" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Venue</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Organizer Contact Phone</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="For participants to reach you" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Organizer Contact Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="Support email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>

            {/* Sub-Events Section */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-white tracking-wide">Sub-Events & Categories</label>
                <button type="button" onClick={addSubEvent} className="text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors font-bold tracking-wide">
                  + Add Sub-Event
                </button>
              </div>
              
              {formData.subEvents.length === 0 ? (
                <p className="text-xs text-gray-500 italic mb-4">No sub-events added. Participants will register for the main event.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {formData.subEvents.map((sub, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/20 border border-white/5 relative group">
                      <button type="button" onClick={() => removeSubEvent(idx)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sub-Event Title</label>
                          <input type="text" value={sub.title} onChange={(e) => handleSubEventChange(idx, 'title', e.target.value)} placeholder="e.g. AI Track" required className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-sm text-white px-1 py-2 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Prize (₹)</label>
                          <input type="number" value={sub.prizeMoney} onChange={(e) => handleSubEventChange(idx, 'prizeMoney', e.target.value)} min="0" className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-sm text-white px-1 py-2 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Entry Fee (₹)</label>
                          <input type="number" value={sub.entryFee} onChange={(e) => handleSubEventChange(idx, 'entryFee', e.target.value)} min="0" className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-sm text-white px-1 py-2 focus:outline-none" />
                        </div>
                      </div>

                      {/* Sub-Sub-Events */}
                      <div className="mt-4 pl-4 border-l-2 border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-400 tracking-wide">Nested Sub-Events</label>
                          <button type="button" onClick={() => addSubSubEvent(idx)} className="text-[10px] px-2 py-1 bg-white/5 text-gray-300 hover:bg-white/10 rounded transition-colors font-bold tracking-wide">
                            + Add Nested
                          </button>
                        </div>
                        {sub.subSubEvents && sub.subSubEvents.map((subSub, ssIdx) => (
                          <div key={ssIdx} className="p-2 mb-2 rounded bg-black/40 border border-white/5 relative group/ss">
                            <button type="button" onClick={() => removeSubSubEvent(idx, ssIdx)} className="absolute top-1 right-1 p-1 text-red-400 hover:bg-red-500/20 rounded opacity-0 group-hover/ss:opacity-100 transition-opacity">
                              <TrashIcon className="w-3 h-3" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <input type="text" value={subSub.title} onChange={(e) => handleSubSubEventChange(idx, ssIdx, 'title', e.target.value)} placeholder="Nested Title" required className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-xs text-white px-1 py-1 focus:outline-none" />
                              </div>
                              <div>
                                <input type="number" value={subSub.prizeMoney} onChange={(e) => handleSubSubEventChange(idx, ssIdx, 'prizeMoney', e.target.value)} placeholder="Prize (₹)" min="0" className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-xs text-white px-1 py-1 focus:outline-none" />
                              </div>
                              <div>
                                <input type="number" value={subSub.entryFee} onChange={(e) => handleSubSubEventChange(idx, ssIdx, 'entryFee', e.target.value)} placeholder="Fee (₹)" min="0" className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 text-xs text-white px-1 py-1 focus:outline-none" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end space-x-4">
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', description: '', date: '', venue: '', prizeMoneyPool: 0, contactPhone: '', contactEmail: '', category: 'Technology', subEvents: [] });
                  }}
                  className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all cursor-pointer">
                {editingId ? 'Update Event' : 'Publish Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageEvents;
