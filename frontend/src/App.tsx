import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ReceptionistDashboard from './pages/ReceptionistDashboard'
import WaitingRoom from './pages/WaitingRoom'
import { initSocket } from './services/socket'

// Initialize socket on app load
initSocket()

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/" element={<Navigate to="/receptionist" replace />} />
        <Route path="*" element={<Navigate to="/receptionist" replace />} />
      </Routes>
    </Router>
  )
}

export default App
