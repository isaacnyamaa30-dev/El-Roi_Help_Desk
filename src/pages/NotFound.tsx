import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-neutral-bg text-center">
      <p className="font-display text-3xl font-bold text-navy">404</p>
      <p className="mt-2 text-gray-600">This page could not be found.</p>
      <Link
        to="/"
        className="mt-4 rounded-md bg-royal px-4 py-2 text-sm font-medium text-white hover:bg-royal-dark"
      >
        Go home
      </Link>
    </div>
  )
}
