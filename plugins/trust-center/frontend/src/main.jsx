import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TrustCenter from './pages/TrustCenter.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RequesterAccess from './pages/RequesterAccess.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TrustCenter />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/requester-login" element={<LoginPage requester />} />
          <Route path="/access" element={<RequesterAccess />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
