import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { APP_COPYRIGHT, APP_TAGLINE, ROLE_LABELS } from '../../constants'
import { initials } from '../../utils/format'
import { navForRole } from './navConfig'

export function AppShell() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = navForRole(role)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-gold text-navy shadow-sm'
        : 'text-blue-100/90 hover:bg-navy-light hover:text-white'
    }`

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkClass}
          onClick={() => setMobileOpen(false)}
        >
          {item.label}
        </NavLink>
      ))}
      <button
        onClick={handleSignOut}
        className="mt-auto block rounded-md px-3 py-2 text-left text-sm font-medium text-gray-200 hover:bg-navy-light hover:text-white"
      >
        Logout
      </button>
    </nav>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-gold bg-navy px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-1 text-gray-200 hover:bg-navy-light md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <div>
            <p className="font-display text-sm font-bold uppercase leading-tight tracking-wide sm:text-base">
              EL-ROI <span className="text-gold">Help Desk</span>
            </p>
            <p className="hidden text-xs text-blue-100/70 sm:block">
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">
              {profile?.full_name}
            </p>
            <p className="text-xs text-gold">
              {role ? ROLE_LABELS[role] : ''}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-semibold text-navy">
            {profile ? initials(profile.full_name) : '?'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* desktop sidebar */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto bg-navy-deep md:block">
          {sidebar}
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="w-56 bg-navy-deep">{sidebar}</div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-ink-soft">
            {APP_COPYRIGHT}
          </footer>
        </main>
      </div>
    </div>
  )
}
