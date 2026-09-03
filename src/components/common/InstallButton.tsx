import { useState } from 'react'
import { Download } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * "Install app" button — always shown.
 *   - Fires the native install prompt when the browser offers one.
 *   - Otherwise shows the manual steps for the user's platform.
 */
export function InstallButton({
  variant = 'solid',
}: {
  variant?: 'solid' | 'ghost' | 'light'
}) {
  const { canInstall, manualHint, promptInstall } = useInstallPrompt()
  const [showHint, setShowHint] = useState(false)
  const [done, setDone] = useState(false)

  const cls =
    variant === 'ghost'
      ? 'border border-white/40 text-white hover:bg-white/10'
      : variant === 'light'
        ? 'border border-royal/30 text-royal hover:bg-royal/5'
        : 'bg-green text-white hover:bg-green-dark'

  async function handleClick() {
    if (canInstall) {
      const outcome = await promptInstall()
      if (outcome === 'accepted') setDone(true)
      else setShowHint(true)
      return
    }
    setShowHint((v) => !v)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${cls}`}
      >
        <Download className="h-4 w-4" />
        {done ? 'Installed ✓' : 'Install app'}
      </button>
      {showHint && (
        <div className="absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-md bg-white p-3 text-left text-xs text-ink shadow-xl ring-1 ring-black/5">
          <p className="font-semibold text-navy">How to install</p>
          <p className="mt-1">{manualHint}</p>
          <button onClick={() => setShowHint(false)} className="mt-2 text-royal">
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
