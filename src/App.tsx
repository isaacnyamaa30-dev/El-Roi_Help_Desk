import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from './constants'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'

import { Landing } from './pages/auth/Landing'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

import { Dashboard } from './pages/user/Dashboard'
import { NewTicket } from './pages/user/NewTicket'
import { MyTickets } from './pages/user/MyTickets'
import { Profile } from './pages/user/Profile'
import { TicketDetail } from './pages/TicketDetail'

import { AgentDashboard } from './pages/agent/AgentDashboard'
import { AgentTickets } from './pages/agent/AgentTickets'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AllTickets } from './pages/admin/AllTickets'
import { AgentsList } from './pages/admin/AgentsList'
import { UsersAdmin } from './pages/admin/UsersAdmin'
import { Reports } from './pages/admin/Reports'

import { NotFound } from './pages/NotFound'

const STAFF = [ROLES.MANAGER, ROLES.ADMIN]

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* authenticated (any role) */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/tickets/new" element={<NewTicket />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* agent */}
      <Route
        element={
          <ProtectedRoute allow={[ROLES.AGENT]}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/tickets" element={<AgentTickets />} />
        <Route path="/agent/tickets/:id" element={<TicketDetail />} />
      </Route>

      {/* manager / admin */}
      <Route
        element={
          <ProtectedRoute allow={STAFF}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tickets" element={<AllTickets />} />
        <Route
          path="/admin/tickets/unassigned"
          element={<AllTickets unassignedOnly />}
        />
        <Route path="/admin/tickets/:id" element={<TicketDetail />} />
        <Route path="/admin/agents" element={<AgentsList />} />
        <Route path="/admin/users" element={<UsersAdmin />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
