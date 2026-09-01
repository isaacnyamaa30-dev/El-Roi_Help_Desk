import { useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

/**
 * "Install app" call to action.
 *   - Chrome / Edge / Android: fires the native install prompt.
 *   - iOS Safari: shows the Share → Add to Home Screen hint.
 *   - Already installed / unsupported: renders nothing.
 */
export function InstallButton({
  variant = 'solid',
}: {
  variant?: 'solid' | 'ghost'
}) {
  const { canInstall, isIOS, promptInstall } = useInstallPrompt()
  const [showIOSHint, setShowIOSHint] = useState(false)

  if (!canInstall && !isIOS) return null

  const cls =
    variant === 'ghost'
      ? 'rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
      : 'rounded-md bg-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark'

  if (isIOS) {
    return (
      <div className="relative">
        <button className={cls} onClick={() => setShowIOSHint((v) => !v)}>
          Install app
        </button>
        {showIOSHint && (
          <p className="absolute left-1/2 z-10 mt-2 w-60 -translate-x-1/2 rounded-md bg-white p-3 text-xs text-ink shadow-lg">
            In Safari, tap the <strong>Share</strong> icon, then{' '}
            <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>
    )
  }

  return (
    <button className={cls} onClick={promptInstall}>
      Install app
    </button>
  )
}
