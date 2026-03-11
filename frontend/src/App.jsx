import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './store/slices/authSlice'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import LoadingScreen from './components/ui/LoadingScreen'
import { initSocket } from './services/socket'

function PrivateRoute({ children }) {
  const { user, token, initialized } = useSelector(s => s.auth)
  if (!initialized) return <LoadingScreen />
  if (!token || !user) return <Navigate to="/login" />
  return children
}

function AdminRoute({ children }) {
  const { user, token, initialized } = useSelector(s => s.auth)
  if (!initialized) return <LoadingScreen />
  if (!token || !user) return <Navigate to="/admin/login" />
  if (!user.isAdmin) return <Navigate to="/chat" />
  return children
}

function PublicRoute({ children }) {
  const { user, token } = useSelector(s => s.auth)
  if (token && user) return <Navigate to="/chat" />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token, user, initialized } = useSelector(s => s.auth)

  useEffect(() => {
    if (token) dispatch(getMe())
    else { /* mark as initialized */ }
  }, [])

  useEffect(() => {
    if (token && user) {
      initSocket(token)
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [token, user])

  if (!initialized && token) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}