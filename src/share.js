// Opens the phone's share sheet. Where there isn't one, copies the link instead.
// Returns 'shared', 'copied', 'cancelled' or 'failed'.
export async function share({ title, text, path }) {
  const url = `${window.location.origin}${path}`
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return copyTheOldWay(url) ? 'copied' : 'failed'
  }
}

// For browsers that block the clipboard: select hidden text and copy it.
function copyTheOldWay(text) {
  const box = document.createElement('textarea')
  box.value = text
  box.setAttribute('readonly', '')
  box.style.position = 'fixed'
  box.style.opacity = '0'
  document.body.append(box)
  box.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  box.remove()
  return copied
}
