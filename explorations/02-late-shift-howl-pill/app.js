import { posts as sample } from '../../src/posts.js'

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const svg = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`

const icons = {
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

const topSpots = (limit) => {
  const counts = new Map()
  for (const p of sample) if (p.location) counts.set(p.location, (counts.get(p.location) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name]) => name)
}

const isLong = (p) => p.text.length > 200
const fresh = (t) => /^(now|\d+[mh] ago)$/.test(t)

export function mount() {
  const posts = [...sample]
  const places = topSpots(3)
  let filter = null

  const tabs = document.getElementById('tabs')
  const feed = document.getElementById('feed')
  const draft = document.getElementById('draft')
  const send = document.getElementById('send')

  function render() {
    tabs.innerHTML =
      `<button class="tab" data-spot="" aria-pressed="${filter === null}">Latest</button>` +
      places
        .map((p) => `<button class="tab" data-spot="${esc(p)}" aria-pressed="${filter === p}">${esc(short[p] ?? p)}</button>`)
        .join('')

    feed.innerHTML = posts
      .filter((p) => filter === null || p.location === filter)
      .map(
        (p) => `
        <article class="post">
          <div class="avatar" aria-hidden="true">${esc(p.author[0].toUpperCase())}</div>
          <div>
            <div class="who">
              <strong>${esc(p.author)}</strong>
              <span class="meta">${p.location ? esc(p.location) + ' · ' : ''}</span>
              <span class="meta ${fresh(p.time) ? 'fresh' : ''}">${esc(p.time)}</span>
            </div>
            <p class="text ${isLong(p) ? 'clamp' : ''}">${esc(p.text)}</p>
            ${isLong(p) ? '<button class="more" data-more aria-expanded="false">Read more</button>' : ''}
            <div class="actions">
              <button class="howl" data-like aria-pressed="false">${icons.howl}<span class="word">Howl</span></button>
              <button class="act" aria-label="Reply">${icons.reply}</button>
              <button class="act" aria-label="Share">${icons.share}</button>
            </div>
          </div>
        </article>`,
      )
      .join('')
  }

  draft.addEventListener('input', () => (send.disabled = draft.value.trim() === ''))
  document.getElementById('composer').addEventListener('submit', (e) => {
    e.preventDefault()
    if (!draft.value.trim()) return
    posts.unshift({ id: Date.now(), author: 'you', location: null, time: 'now', text: draft.value.trim() })
    draft.value = ''
    send.disabled = true
    filter = null
    render()
  })
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-spot]')
    if (!b) return
    filter = b.dataset.spot || null
    render()
  })
  document.addEventListener('click', (e) => {
    const like = e.target.closest('[data-like]')
    if (like) {
      const on = like.getAttribute('aria-pressed') !== 'true'
      like.setAttribute('aria-pressed', String(on))
      like.querySelector('.word').textContent = on ? 'Howled' : 'Howl'
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

  render()
}
