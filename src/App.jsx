import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Admin/Sidebar';
import EventCard from './components/Events/EventCard';
import DashboardStats from './components/Admin/DashboardStats';
import ManageEvents from './components/Admin/ManageEvents';
import Approvals from './components/Admin/Approvals';
import Settings from './components/Admin/Settings';
import Analytics from './components/Admin/Analytics';
import AdminReviews from './components/Admin/AdminReviews';
import AdminRequests from './components/Admin/AdminRequests';
import EventLocations from './components/Events/EventLocations';
import Leaderboard from './components/Admin/Leaderboard';
import NotificationCenter from './components/Effects/NotificationCenter';
import Login from './pages/Login';
import VerifyCertificate from './pages/VerifyCertificate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import InteractiveGlow from './components/Effects/InteractiveGlow';
import SparklesEffect from './components/Effects/SparklesEffect';

const API_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' ? `http://${window.location.hostname}:5001/api` : '/api');

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <InteractiveGlow />
      <SparklesEffect events={events} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-72 p-10 min-h-screen relative">
        <header className="flex justify-end mb-6 relative z-[60]">
          <NotificationCenter />
        </header>
        {activeTab === 'Dashboard' && <DashboardStats events={events} />}
        {activeTab === 'Manage Events' && <ManageEvents onEventAdded={fetchEvents} events={events} eventToEdit={eventToEdit} onEditStart={() => setEventToEdit(null)} />}
        {activeTab === 'Approvals' && <Approvals />}
        {activeTab === 'Admin Requests' && <AdminRequests />}
        {activeTab === 'Settings' && <Settings />}
        {activeTab === 'Reviews' && <AdminReviews />}
        {activeTab === 'Analytics' && <Analytics events={events} />}
        {activeTab === 'Leaderboard' && <Leaderboard />}
        {activeTab === 'Event Locations' && <EventLocations events={events} />}
        {activeTab === 'Registrations' && (
          <div className="max-w-7xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">Event Discovery</h2>
              <p className="text-gray-400">Find and register for the world's most premium hackathons and summits.</p>
            </header>
            
            {loading ? (
              <div className="text-center text-gray-400 py-10">Loading real events from MongoDB...</div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-400 py-10">No events found. Go to Manage Events to add some!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.filter(e => new Date(e.date) >= new Date()).length === 0 ? (
                   <p className="text-gray-400 col-span-3 text-center py-6">No events available right now.</p>
                ) : (
                  events.filter(e => new Date(e.date) >= new Date()).map(event => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
