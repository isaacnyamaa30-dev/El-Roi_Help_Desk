import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop'

interface InstallState {
  /** True when the browser can show the native install prompt right now. */
  canInstall: boolean
  /** True when the app is already running as an installed PWA. */
  isInstalled: boolean
  platform: Platform
  /** Manual step-by-step instructions for this platform. */
  manualHint: string
  /** Fire the native install prompt. Returns the user's choice. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

const HINTS: Record<Platform, string> = {
  ios: 'Open this page in Safari, tap the Share icon, then "Add to Home Screen".',
  android:
    'Tap the ⋮ menu at the top right of Chrome, then choose "Install app" (or "Add to Home screen").',
  desktop:
    'Click the install icon in the address bar, or open the browser menu and choose "Install EL-ROI Services".',
}

export function useInstallPrompt(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  const ua =
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const platform: Platform = /iphone|ipad|ipod/i.test(ua)
    ? 'ios'
    : /android/i.test(ua)
      ? 'android'
      : 'desktop'

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    setIsInstalled(Boolean(standalone))

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setDeferred(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferred) return 'unavailable' as const
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome
  }

  return {
    canInstall: Boolean(deferred) && !isInstalled,
    isInstalled,
    platform,
    manualHint: HINTS[platform],
    promptInstall,
  }
}
