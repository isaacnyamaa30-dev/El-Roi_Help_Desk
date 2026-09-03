import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from './constants'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'

import { PublicLayout } from './pages/public/PublicLayout'
import { Home } from './pages/public/Home'
import { ServicesOverview } from './pages/public/ServicesOverview'
import { CategoryPage } from './pages/public/CategoryPage'
import { HowItWorks } from './pages/public/HowItWorks'

import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

import { ClientDashboard } from './pages/client/ClientDashboard'
import { BookService } from './pages/client/BookService'
import { MyBookings } from './pages/client/MyBookings'
import { ClientPayments } from './pages/client/ClientPayments'
import { BookingDetail } from './pages/BookingDetail'
import { Profile } from './pages/Profile'

import { StaffDashboard } from './pages/staff/StaffDashboard'
import { StaffJobs } from './pages/staff/StaffJobs'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminBookings } from './pages/admin/AdminBookings'
import { AdminCalendar } from './pages/admin/AdminCalendar'
import { AdminServices } from './pages/admin/AdminServices'
import { AdminPrices } from './pages/admin/AdminPrices'
import { AdminClients } from './pages/admin/AdminClients'
import { AdminStaff } from './pages/admin/AdminStaff'
import { AdminPayments } from './pages/admin/AdminPayments'
import { AdminReports } from './pages/admin/AdminReports'
import { AdminSettings } from './pages/admin/AdminSettings'

import { NotFound } from './pages/NotFound'

const CLIENT = [ROLES.CLIENT]
const WORKER = [ROLES.CLEANER, ROLES.DRIVER]
const STAFF = [ROLES.MANAGER, ROLES.ADMIN]

export default function App() {
  return (
    <Routes>
      {/* public marketing site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesOverview />} />
        <Route path="/services/cleaning" element={<CategoryPage slug="cleaning" />} />
        <Route path="/services/driving" element={<CategoryPage slug="driving" />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* client */}
      <Route
        element={
          <ProtectedRoute allow={CLIENT}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/book" element={<BookService />} />
        <Route path="/book/cleaning" element={<BookService presetCategory="cleaning" />} />
        <Route path="/book/driving" element={<BookService presetCategory="driving" />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/payments" element={<ClientPayments />} />
      </Route>

      {/* profile — any authenticated user */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* staff (cleaner / driver) */}
      <Route
        element={
          <ProtectedRoute allow={WORKER}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/jobs" element={<StaffJobs />} />
        <Route path="/staff/jobs/:id" element={<BookingDetail />} />
        <Route path="/staff/history" element={<StaffJobs completed />} />
        <Route path="/staff/profile" element={<Profile />} />
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
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route
          path="/admin/bookings/unassigned"
          element={<AdminBookings unassignedOnly />}
        />
        <Route path="/admin/bookings/:id" element={<BookingDetail />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/prices" element={<AdminPrices />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
