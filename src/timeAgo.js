const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function timeAgo(isoDate, now = Date.now()) {
  const age = Math.max(0, now - new Date(isoDate).getTime())
  if (age < MINUTE) return 'just now'
  if (age < HOUR) return `${Math.floor(age / MINUTE)}m ago`
  if (age < DAY) return `${Math.floor(age / HOUR)}h ago`
  if (age < 7 * DAY) return `${Math.floor(age / DAY)}d ago`
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const isFresh = (isoDate, now = Date.now()) => now - new Date(isoDate).getTime() < DAY
