import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  APP_AUTHOR,
  APP_CONTACT,
  APP_COPYRIGHT,
  APP_SHORT_NAME,
  APP_TAGLINE,
} from '../../constants'
import { InstallButton } from '../../components/common/InstallButton'

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'How It Works', to: '/how-it-works' },
]

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b-2 border-gold bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="font-display text-lg font-bold uppercase tracking-wide"
          >
            EL-ROI <span className="text-gold">Services</span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-navy-light text-white'
                      : 'text-blue-100/80 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-100/90 hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t-2 border-gold bg-navy px-6 py-6 text-center text-xs text-blue-100/70">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
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
