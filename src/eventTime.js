const DAY = 24 * 60 * 60 * 1000

const startOfDay = (date) => {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day.getTime()
}

// "Today · 6 PM", "Tomorrow · 7 PM" or "Sat, Nov 7 · 1 PM"
export function eventWhen(isoDate, now = Date.now()) {
  const date = new Date(isoDate)
  const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY)
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: date.getMinutes() ? '2-digit' : undefined })
  const day =
    days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day} · ${time}`
}

export const eventMonth = (isoDate) => new Date(isoDate).toLocaleDateString('en-US', { month: 'short' })
export const eventDay = (isoDate) => new Date(isoDate).getDate()

// An event counts as over two hours after it starts.
export const isOver = (isoDate, now = Date.now()) => new Date(isoDate).getTime() + 2 * 60 * 60 * 1000 < now
