import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TablesPage from './pages/TablesPage'
import OrdersPage from './pages/OrdersPage'
import ReservationsPage from './pages/ReservationsPage'
import BillingPage from './pages/BillingPage'
import MenuPage from './pages/MenuPage'
import UsersPage from './pages/UsersPage'

// manager = full access
// staff   = orders, reservations, tables only
function PrivateRoute({ children, managerOnly = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (managerOnly && user.role !== 'manager') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<PrivateRoute managerOnly><Dashboard /></PrivateRoute>} />
        <Route path="tables"       element={<TablesPage />} />
        <Route path="orders"       element={<OrdersPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="billing"      element={<PrivateRoute managerOnly><BillingPage /></PrivateRoute>} />
        <Route path="menu"         element={<PrivateRoute managerOnly><MenuPage /></PrivateRoute>} />
        <Route path="users"        element={<PrivateRoute managerOnly><UsersPage /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
