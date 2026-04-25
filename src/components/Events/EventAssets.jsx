import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TicketIcon, AcademicCapIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const EventAssets = ({ show, type, event, user, currentReg, onClose }) => {
  if (!show) return null;

  // Smart Fallback for IDs (for users approved before the new system)
  const displayId = currentReg?.certificateId || `EP-2026-${user?._id?.slice(-4).toUpperCase() || 'XXXX'}-${event?._id?.slice(-4).toUpperCase() || '0000'}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`USER:${user._id}|EVENT:${event._id}|ID:${displayId}`)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          role="dialog"
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-white/5 print:hidden">
            <div className="flex items-center gap-3">
              {type === 'ticket' ? <TicketIcon className="w-6 h-6 text-indigo-400" /> : <AcademicCapIcon className="w-6 h-6 text-amber-400" />}
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                {type === 'ticket' ? 'Entry Ticket' : 'Certificate of Participation'}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400"><XMarkIcon className="w-6 h-6" /></button>
          </div>

          {/* Content Area */}
          <div className="p-10 bg-slate-950/50 flex flex-col items-center text-center printable-content">
            {type === 'ticket' ? (
              /* TICKET DESIGN */
              <div className="w-full max-w-md bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="p-8 border-b-2 border-dashed border-indigo-500/20">
                   <div className="flex justify-between items-start mb-6">
                      <div className="text-left">
                        <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-1">Official Entry</p>
                        <h4 className="text-2xl font-black text-white leading-tight">{event.title}</h4>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white">EP</div>
                   </div>
                   
                   <div className="space-y-4 text-left">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500">Attendee</p>
                        <p className="text-lg font-bold text-white">{user.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-500">Date</p>
                          <p className="text-sm font-bold text-white">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-500">Venue</p>
                          <p className="text-sm font-bold text-white truncate">{event.venue}</p>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 flex flex-col items-center bg-black/20">
                  <div className="p-4 bg-white rounded-2xl mb-4">
                    <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase">Scan at Entrance</p>
                </div>
              </div>
            ) : (
              /* CERTIFICATE DESIGN */
              <div className="w-full aspect-[1.414/1] bg-white p-12 text-black relative flex flex-col items-center justify-center border-[12px] border-amber-500/10">
                <div className="absolute inset-4 border-2 border-amber-500/20" />
                <div className="absolute inset-8 border border-amber-500/10" />
                
                <h4 className="text-4xl font-serif text-amber-600 mb-2 italic">Certificate</h4>
                <p className="text-xs uppercase tracking-[0.5em] font-bold text-gray-400 mb-10">of Participation</p>
                
                <p className="text-sm text-gray-500 mb-2 italic">This is to certify that</p>
                <h2 className="text-4xl font-black text-slate-900 border-b-2 border-slate-900 px-8 pb-2 mb-8">{user.name}</h2>
                
                <p className="text-sm text-gray-500 mb-2 italic">has successfully participated in</p>
                <h3 className="text-2xl font-bold text-indigo-900 mb-8">{event.title}</h3>
                
                <div className="mb-10 text-center">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mb-1">Unique Verification ID</p>
                  <p className="text-sm font-mono font-black text-slate-800 bg-slate-100 px-4 py-1 rounded-lg border border-slate-200">
                    {displayId}
                  </p>
                  <p className="text-[7px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Verify at: eventportal.com/verify</p>
                </div>

                <div className="flex justify-between w-full mt-auto px-10">
                  <div className="text-center border-t border-slate-300 pt-2 min-w-[120px]">
                    <p className="text-[10px] font-bold uppercase">Date</p>
                    <p className="text-xs">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-center border-t border-slate-300 pt-2 min-w-[120px]">
                    <p className="text-[10px] font-bold uppercase">Authorized By</p>
                    <p className="text-[10px] italic">Event Portal Admin</p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-20 h-20 opacity-10">
                   <AcademicCapIcon className="w-full h-full text-amber-600" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-6 flex flex-col items-center gap-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 print:hidden relative z-50">
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <button 
                onClick={handlePrint}
                className="flex-1 max-w-xs px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95"
              >
                <ArrowDownTrayIcon className="w-6 h-6" />
                <span>Download PDF / Print</span>
              </button>
              
              {type === 'certificate' && (
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/verify/${displayId}`;
                    navigator.clipboard.writeText(link);
                    const btn = document.getElementById('copy-btn');
                    if (btn) {
                      const originalText = btn.innerText;
                      btn.innerText = 'Link Copied!';
                      setTimeout(() => btn.innerText = originalText, 2000);
                    }
                  }}
                  id="copy-btn"
                  className="flex-1 max-w-xs px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black border border-white/10 transition-all active:scale-95 flex items-center justify-center"
                >
                  Copy Verification Link
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              Tip: Select <span className="text-gray-300">"Save as PDF"</span> in the print menu
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventAssets;
