import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { APP_SHORT_NAME, APP_TAGLINE } from '../../constants'

const SHARE_URL = 'https://el-roi-help-desk.vercel.app/'
const SHARE_TEXT = `${APP_SHORT_NAME} — book weekend cleaning & driving services. ${APP_TAGLINE}`

/**
 * Share the app link. Uses the native share sheet on phones (Web Share API)
 * and falls back to copying the link to the clipboard on desktop.
 * The link opens the app in the browser — no install required.
 */
export function ShareButton({
  variant = 'solid',
  label = 'Share this app',
}: {
  variant?: 'solid' | 'ghost' | 'light'
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const data = { title: APP_SHORT_NAME, text: SHARE_TEXT, url: SHARE_URL }
    if (navigator.share) {
      try {
        await navigator.share(data)
        return
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copy this link to share:', SHARE_URL)
    }
  }

  const cls =
    variant === 'ghost'
      ? 'border border-white/40 text-white hover:bg-white/10'
      : variant === 'light'
        ? 'border border-royal/30 text-royal hover:bg-royal/5'
        : 'bg-navy text-white hover:bg-navy-deep'

  return (
    <button
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${cls}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> {label}
        </>
      )}
    </button>
  )
}
