import React from 'react';
import { motion } from 'framer-motion';
import { 
  Squares2X2Icon, 
  CalendarDaysIcon, 
  UsersIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  CheckBadgeIcon,
  StarIcon,
  MapPinIcon,
  TrophyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', icon: Squares2X2Icon },
  { name: 'Manage Events', icon: CalendarDaysIcon },
  { name: 'Registrations', icon: UsersIcon },
  { name: 'Event Locations', icon: MapPinIcon },
  { name: 'Approvals', icon: CheckBadgeIcon },
  { name: 'Admin Requests', icon: ShieldCheckIcon },
  { name: 'Reviews', icon: StarIcon },
  { name: 'Leaderboard', icon: TrophyIcon },
  { name: 'Analytics', icon: ChartBarIcon },
  { name: 'Settings', icon: Cog6ToothIcon },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();

  let filteredItems;
  if (user?.role === 'SuperAdmin') {
    filteredItems = navItems.filter(item => !['Event Locations'].includes(item.name));
  } else if (user?.role === 'Admin' || user?.role === 'Organizer') {
    filteredItems = navItems.filter(item =>
      ['Dashboard', 'Manage Events', 'Registrations', 'Event Locations', 'Approvals', 'Leaderboard', 'Settings'].includes(item.name)
    );
  } else {
    filteredItems = navItems.filter(item =>
      ['Dashboard', 'Registrations', 'Event Locations', 'Leaderboard', 'Settings'].includes(item.name)
    );
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col z-50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
          <span className="text-white font-black text-xl">E</span>
        </div>
        <h1 className="text-xl font-black text-white tracking-tighter uppercase">EVENT PORTAL</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-bold tracking-tight text-sm">{item.name}</span>
              {isActive && (
                <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <div className="mb-6 px-4 py-3 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold tracking-tight text-sm"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
