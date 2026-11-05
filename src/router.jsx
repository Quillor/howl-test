import { useEffect, useState } from 'react'

// Tiny router: pages are web addresses like /events or /post/12, so links can be shared.

export function navigate(path) {
  if (path !== window.location.pathname) window.history.pushState({ inApp: true }, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return path
}

// A normal link that switches pages without reloading. Cmd-click still opens a new tab.
export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
      {...props}
    />
  )
}
