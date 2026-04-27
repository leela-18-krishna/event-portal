import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import SOSPage from './pages/SOSPage'
import Dashboard from './pages/Dashboard'
import HospitalDashboard from './pages/HospitalDashboard'

function App() {
  const location = useLocation();

  return (
    <div className="App selection:bg-primary/30">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hospital" element={<HospitalDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
