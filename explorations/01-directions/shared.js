import { posts } from '../../src/posts.js'

export { posts }

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const svg = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`

export const icons = {
  howl: svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
  reply: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L3 20.5l1.5-5A8 8 0 1 1 21 12z"/>'),
  share: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
}

const short = {
  'Talley Student Union': 'Talley',
  'Carter-Finley Stadium': 'Carter-Finley',
  'D. H. Hill Jr. Library': 'Hill Library',
  'Engineering Building II': 'EB II',
  'Centennial Campus': 'Centennial',
  'Fountain Dining Hall': 'Fountain',
  'Reynolds Coliseum': 'Reynolds',
}
export const shortPlace = (name) => short[name] ?? name

export const spots = (limit) => {
  const counts = new Map()
  for (const p of posts) if (p.location) counts.set(p.location, (counts.get(p.location) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name]) => name)
}

export const isLong = (post) => post.text.length > 200

const howlButton = (style) =>
  style === 'icon'
    ? `<button class="act" data-like aria-pressed="false" aria-label="Howl">${icons.howl}</button>`
    : `<button class="howl" data-like aria-pressed="false">${style === 'bar' ? '' : icons.howl}<span class="word">Howl</span></button>`

export const actions = (style = 'icon') => `
  <div class="actions">
    ${style === 'bar' ? '' : howlButton(style)}
    <button class="act" aria-label="Reply">${icons.reply}</button>
    <button class="act" aria-label="Share">${icons.share}</button>
  </div>`

export const barButton = () => howlButton('bar')

export const moreButton = (post) =>
  isLong(post) ? `<button class="more" data-more aria-expanded="false">Read more</button>` : ''

export function wire() {
  document.addEventListener('click', (e) => {
    const like = e.target.closest('[data-like]')
    if (like) {
      const on = like.getAttribute('aria-pressed') !== 'true'
      like.setAttribute('aria-pressed', String(on))
      const word = like.querySelector('.word')
      if (word) word.textContent = on ? 'Howled' : 'Howl'
      return
    }
    const more = e.target.closest('[data-more]')
    if (more) {
      const text = more.previousElementSibling
      const open = text.classList.toggle('clamp') === false
      more.setAttribute('aria-expanded', String(open))
      more.textContent = open ? 'Show less' : 'Read more'
    }
  })
}
