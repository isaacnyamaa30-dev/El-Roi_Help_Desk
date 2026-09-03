import { useEffect, useState } from 'react'

/**
 * The service worker itself is registered by vite-plugin-pwa
 * (`injectRegister: 'auto'`, `registerType: 'autoUpdate'`) — it updates and
 * reloads on its own. This component only shows an offline notice so people
 * understand why a booking can't be submitted.
 */
export function PwaManager() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine,
  )

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-3">
      <div className="rounded-md bg-navy px-4 py-2 text-sm text-white shadow-lg">
        You are offline. You can browse, but bookings can’t be submitted until
        you reconnect.
      </div>
    </div>
  )
}
