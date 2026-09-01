import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { APP_NAME, APP_TAGLINE, ROLE_LABELS } from '../../constants'
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
        ? 'bg-royal text-white'
        : 'text-gray-200 hover:bg-navy-light hover:text-white'
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
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="flex items-center justify-between gap-3 bg-navy px-4 py-3 text-white">
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
            <p className="text-sm font-semibold leading-tight sm:text-base">
              {APP_NAME}
            </p>
            <p className="hidden text-xs text-gray-300 sm:block">{APP_TAGLINE}</p>
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

      <div className="flex flex-1">
        {/* desktop sidebar */}
        <aside className="hidden w-56 shrink-0 bg-navy md:block">{sidebar}</aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="w-56 bg-navy">{sidebar}</div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
