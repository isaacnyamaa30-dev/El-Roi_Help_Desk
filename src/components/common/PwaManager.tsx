import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Registers the service worker and surfaces two small banners:
 *   - "A new version is available" → Update Now (spec §82)
 *   - "You are currently offline"  → shell still works, writes are blocked
 */
export function PwaManager() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, reg) {
      // Check for a new deploy every 30 minutes while the app stays open.
      if (reg)
        setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000)
    },
  })

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

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3">
      {offline && (
        <div className="pointer-events-auto rounded-md bg-navy px-4 py-2 text-sm text-white shadow-lg">
          You are offline. You can browse, but bookings can’t be submitted
          until you reconnect.
        </div>
      )}
      {needRefresh && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-md bg-gold px-4 py-2 text-sm font-medium text-navy shadow-lg">
          A new version of EL-ROI Services is available.
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded bg-navy px-3 py-1 text-xs font-semibold text-white hover:bg-navy-deep"
          >
            Update Now
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-xs text-navy/70"
          >
            Later
          </button>
        </div>
      )}
    </div>
  )
}
