import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  PlusIcon, 
  QueueListIcon, 
  BeakerIcon,
  ArrowPathIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const HospitalDashboard = () => {
  const [inventory, setInventory] = useState([
    { group: 'O+', units: 12, status: 'Healthy' },
    { group: 'O-', units: 2, status: 'Critical' },
    { group: 'A+', units: 8, status: 'Healthy' },
    { group: 'B-', units: 3, status: 'Low' },
  ]);

  return (
    <div className="min-h-screen bg-bg-dark flex">
      {/* Side Nav */}
      <nav className="w-20 lg:w-64 border-r border-white/5 bg-black/40 p-6 flex flex-col items-center lg:items-start">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-10">
          <BuildingOffice2Icon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-8">
          <QueueListIcon className="w-6 h-6 text-primary cursor-pointer" />
          <BeakerIcon className="w-6 h-6 text-text-muted hover:text-white cursor-pointer" />
          <ArrowPathIcon className="w-6 h-6 text-text-muted hover:text-white cursor-pointer" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">City General Hospital</h2>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-secondary" />
              Verified Medical Node #882
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            TRIGGER NEW SOS
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Inventory Panel */}
          <section className="xl:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px]">Blood Bank Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              {inventory.map((item) => (
                <div key={item.group} className="glass-card p-4 text-center">
                  <p className="text-2xl font-black text-white mb-1">{item.group}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase mb-3">{item.units} Units</p>
                  <div className={`h-1 w-full rounded-full ${
                    item.status === 'Critical' ? 'bg-primary' : item.status === 'Low' ? 'bg-orange-500' : 'bg-accent'
                  }`} />
                </div>
              ))}
            </div>
          </section>

          {/* Active Missions Panel */}
          <section className="xl:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-[10px]">Active Incoming Missions</h3>
            <div className="space-y-4">
              {[
                { donor: 'Hero #45', blood: 'O-', eta: '4 mins', status: 'En Route' },
                { donor: 'Hero #12', blood: 'B-', eta: '12 mins', status: 'Accepted' },
              ].map((mission, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={mission.donor} 
                  className="glass-card p-6 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-primary">
                      {mission.blood}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{mission.donor}</p>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">ETA: {mission.eta}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[8px] font-black uppercase tracking-widest border border-accent/20">
                      {mission.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default HospitalDashboard;
