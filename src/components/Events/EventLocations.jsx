import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const EventLocations = ({ events }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Event Locations</h2>
        <p className="text-gray-400">Track and find the exact venues for your upcoming events.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.filter(e => new Date(e.date) >= new Date()).map((event, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={event._id}
            className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all group overflow-hidden relative"
          >
            {/* Visual background element */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <MapPinIcon className="w-32 h-32 text-indigo-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30 uppercase">
                  {event.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              
              <div className="flex items-start gap-3 p-4 bg-black/20 border border-white/5 rounded-2xl mb-6 group-hover:border-indigo-500/30 transition-colors">
                <MapPinIcon className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300 font-medium">{event.venue}</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1 font-bold">Confirmed Venue</p>
                </div>
              </div>

              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Open in Maps
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
        <div className="text-center py-20 p-10 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <MapPinIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">No upcoming event locations found.</p>
        </div>
      )}
    </div>
  );
};

export default EventLocations;
