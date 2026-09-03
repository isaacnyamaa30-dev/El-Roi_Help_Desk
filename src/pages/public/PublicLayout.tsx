import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import {
  APP_AUTHOR,
  APP_CONTACT,
  APP_COPYRIGHT,
  APP_SHORT_NAME,
  APP_TAGLINE,
} from '../../constants'
import { InstallButton } from '../../components/common/InstallButton'
import { ShareButton } from '../../components/common/ShareButton'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'How It Works', to: '/how-it-works' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-navy-light text-white'
      : 'text-blue-100/80 hover:text-white'
  }`

export function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b-2 border-gold bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="font-display text-base font-bold uppercase tracking-wide sm:text-lg"
          >
            EL-ROI <span className="text-gold">Services</span>
          </Link>

          <nav className="hidden gap-1 sm:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-2 py-1.5 text-sm font-medium text-blue-100/90 hover:text-white sm:px-3"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Register
            </Link>
            <button
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="rounded-md p-1.5 text-blue-100/90 hover:bg-navy-light sm:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {open && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 pb-3 pt-2 sm:hidden">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-gold bg-navy px-6 py-6 text-center text-xs text-blue-100/70">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
          <ShareButton variant="ghost" label="Share" />
          <InstallButton variant="ghost" />
        </div>
        <p className="mt-4">
          <a href={APP_CONTACT.phoneHref} className="hover:text-gold">
            {APP_CONTACT.phoneDisplay}
          </a>{' '}
          ·{' '}
          <a href={APP_CONTACT.emailHref} className="hover:text-gold">
            {APP_CONTACT.email}
          </a>
        </p>
        <p className="mt-2 font-medium text-blue-100/90">
          {APP_SHORT_NAME} · {APP_TAGLINE} · Designed &amp; developed by{' '}
          {APP_AUTHOR}
        </p>
        <p className="mt-1">{APP_COPYRIGHT}</p>
      </footer>
    </div>
  )
}
