import { posts } from '../posts.js'

const colorNames = [
  ['background', 'Page background'],
  ['surface', 'Hover and fields'],
  ['border', 'Dividers'],
  ['border-strong', 'Field and button borders'],
  ['text', 'Posts and headings'],
  ['text-muted', 'Handles, times and hints'],
  ['accent', 'Buttons, Write and Howled'],
  ['accent-hover', 'Buttons on hover'],
  ['on-accent', 'Text on accent'],
  ['accent-text', 'Fresh times and event months'],
  ['focus', 'Focus ring'],
  ['success', 'Posted or saved'],
  ['warning', 'Running low'],
  ['error', 'Something failed'],
]

const textStyles = [
  ['Wordmark', 'howl-wordmark', 'Howl · 24 bold'],
  ['Post text', 'howl-post-text', 'Free pizza outside the Brickyard · 18 regular'],
  ['Body', '', 'Write a post · 16 regular'],
  ['Meta', 'howl-meta', 'maya_t · 2h ago · 14 regular'],
  ['Fresh time', 'howl-meta is-fresh', '2h ago · 14 bold'],
]

const spaces = [4, 8, 12, 16, 24, 32, 48, 64]

const icon = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`

const icons = {
  howl: icon('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
  reply: icon('<path d="M21 12a8 8 0 0 1-11.6 7.1L3 20.5l1.5-5A8 8 0 1 1 21 12z"/>'),
  share: icon('<path d="M12 15V3M8 7l4-4 4 4"/><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>'),
  ok: icon('<path d="M5 12.5 10 17.5 19 7"/>'),
  warn: icon('<path d="M12 4 2.5 20h19zM12 10v4M12 17h.01"/>'),
  error: icon('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  pin: icon('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
}

const states = (items) =>
  `<div class="states">${items
    .map(
      ([label, html]) =>
        `<div><span class="howl-meta state-label">${label}</span>${html}</div>`,
    )
    .join('')}</div>`

const group = (title, body) =>
  `<div class="state-group"><p class="group-title">${title}</p>${body}</div>`

const buttons = () =>
  group(
    'Main',
    states([
      ['Normal', '<button class="howl-button">Post</button>'],
      ['Hover', '<button class="howl-button is-hover">Post</button>'],
      ['Pressed', '<button class="howl-button is-pressed">Post</button>'],
      ['Disabled', '<button class="howl-button" disabled>Post</button>'],
    ]),
  ) +
  group(
    'Secondary',
    states([
      ['Normal', '<button class="howl-button is-secondary">Save draft</button>'],
      ['Hover', '<button class="howl-button is-secondary is-hover">Save draft</button>'],
      ['Pressed', '<button class="howl-button is-secondary is-pressed">Save draft</button>'],
      ['Disabled', '<button class="howl-button is-secondary" disabled>Save draft</button>'],
    ]),
  ) +
  group(
    'Follow (toggle)',
    states([
      ['Normal', '<button class="howl-button is-secondary" aria-pressed="false">Follow</button>'],
      ['Hover', '<button class="howl-button is-secondary is-hover" aria-pressed="false">Follow</button>'],
      ['Pressed', '<button class="howl-button is-secondary is-pressed" aria-pressed="false">Follow</button>'],
      ['Selected', `<button class="howl-button is-secondary" aria-pressed="true">${icons.ok}Following</button>`],
      ['Disabled', '<button class="howl-button is-secondary" aria-pressed="false" disabled>Follow</button>'],
    ]),
  ) +
  group(
    'Howl reaction',
    states([
      ['Normal', `<button class="howl-pill" aria-pressed="false">${icons.howl}Howl</button>`],
      ['Hover', `<button class="howl-pill is-hover" aria-pressed="false">${icons.howl}Howl</button>`],
      ['Pressed', `<button class="howl-pill is-pressed" aria-pressed="false">${icons.howl}Howl</button>`],
      ['Selected', `<button class="howl-pill" aria-pressed="true">${icons.howl}Howled</button>`],
      ['Disabled', `<button class="howl-pill" aria-pressed="false" disabled>${icons.howl}Howl</button>`],
    ]),
  ) +
  group(
    'Comments and share (icon only)',
    states([
      ['Normal', `<button class="howl-icon-button" aria-label="Reply">${icons.reply}</button>`],
      ['Hover', `<button class="howl-icon-button is-hover" aria-label="Reply">${icons.reply}</button>`],
      ['Pressed', `<button class="howl-icon-button is-pressed" aria-label="Reply">${icons.reply}</button>`],
      ['Disabled', `<button class="howl-icon-button" aria-label="Reply" disabled>${icons.reply}</button>`],
    ]),
  )

const composer = (fieldClass, { value = '', disabled = false, left = '', postDisabled = true, label = 'Post' } = {}) => `
  <div class="howl-composer">
    <div class="howl-avatar" aria-hidden="true">T</div>
    <div>
      <textarea class="howl-composer-field ${fieldClass}" placeholder="What's happening on campus?" aria-label="Write a post" ${disabled ? 'disabled' : ''}>${value}</textarea>
      <div class="howl-composer-bar">
        <span class="howl-meta">${left}</span>
        <button class="howl-button" ${postDisabled ? 'disabled' : ''}>${label}</button>
      </div>
    </div>
  </div>`

const composerStates = () =>
  [
    ['Normal (empty)', composer('')],
    ['Hover', composer('is-hover')],
    ['Pressed: typing', composer('is-focus', { value: 'Free pizza at the', left: '131 left' })],
    [
      'Selected: ready to post',
      composer('', { value: 'Free pizza outside the robotics table. Go!', left: '90 left', postDisabled: false }),
    ],
    ['Disabled: posting', composer('', { value: 'Free pizza outside the robotics table. Go!', disabled: true, label: 'Posting…' })],
  ]
    .map(([label, html]) => `<div class="state-group"><span class="howl-meta state-label">${label}</span><div class="feed">${html}</div></div>`)
    .join('')

const post = (p, { cls = '', fresh = false, howled = false, disabled = false, clamp = false, more = false } = {}) => `
  <article class="howl-post ${cls}">
    <div class="howl-avatar" aria-hidden="true">${p.author[0].toUpperCase()}</div>
    <div>
      <div class="howl-post-who"><strong>${p.author}</strong><span class="howl-meta${fresh ? ' is-fresh' : ''}">${disabled ? 'Sending…' : p.time}</span></div>
      <p class="howl-post-text${clamp ? ' is-clamped' : ''}">${p.text}</p>
      ${more ? '<button class="howl-more">Show more</button>' : ''}
      <div class="howl-post-actions">
        <button class="howl-pill" aria-pressed="${howled}" ${disabled ? 'disabled' : ''}>${icons.howl}${howled ? 'Howled' : 'Howl'}</button>
        <button class="howl-icon-button has-count" aria-label="3 comments" ${disabled ? 'disabled' : ''}>${icons.reply}<span class="howl-count">3</span></button>
        <button class="howl-icon-button" aria-label="Share" ${disabled ? 'disabled' : ''}>${icons.share}</button>
      </div>
    </div>
  </article>`

const postStates = (list) => {
  const [a, b] = list
  const longPost = list.find((p) => p.text.length > 160) ?? b
  return [
    ['Normal', post(a, { fresh: true })],
    ['Hover', post(a, { cls: 'is-hover', fresh: true })],
    ['Pressed', post(a, { cls: 'is-pressed', fresh: true })],
    ['Selected', post(a, { cls: 'is-selected', fresh: true, howled: true })],
    ['Disabled: still sending', post(a, { cls: 'is-disabled', disabled: true })],
    ['Long post', post(longPost, { clamp: true, more: true })],
    [
      'Empty',
      '<div class="howl-empty"><p>No posts yet. Be the first to post from campus.</p><button class="howl-button is-secondary">Write one</button></div>',
    ],
  ]
    .map(([label, html]) => `<div class="state-group"><span class="howl-meta state-label">${label}</span><div class="feed">${html}</div></div>`)
    .join('')
}

const avatarBtn = (cls, { large = false, pressed = null, disabled = false } = {}) =>
  `<button class="howl-avatar-button ${cls}" aria-label="maya_t's profile" ${pressed === null ? '' : `aria-pressed="${pressed}"`} ${disabled ? 'disabled' : ''}><span class="howl-avatar${large ? ' is-large' : ''}">M</span></button>`

const avatars = () =>
  group(
    'Small (32px, in posts)',
    states([
      ['Normal', avatarBtn('', { pressed: false })],
      ['Hover', avatarBtn('is-hover', { pressed: false })],
      ['Pressed', avatarBtn('is-pressed', { pressed: false })],
      ['Selected', avatarBtn('', { pressed: true })],
      ['Disabled', avatarBtn('', { pressed: false, disabled: true })],
    ]),
  ) +
  group(
    'Large (48px, on a profile)',
    states([
      ['Normal', avatarBtn('', { large: true, pressed: false })],
      ['Hover', avatarBtn('is-hover', { large: true, pressed: false })],
      ['Pressed', avatarBtn('is-pressed', { large: true, pressed: false })],
      ['Selected', avatarBtn('', { large: true, pressed: true })],
      ['Disabled', avatarBtn('', { large: true, pressed: false, disabled: true })],
    ]),
  )

const eventCard = ({ month, day, title, when, place, going, count, past = false, cls = '' }) =>
  `<article class="howl-event ${past ? 'is-past' : ''}">
    <div class="howl-event-date" aria-hidden="true"><span class="month">${month}</span><span class="day">${day}</span></div>
    <div>
      <h4 class="howl-event-title">${title}</h4>
      <p class="howl-meta">${when} · ${place}</p>
      <div class="howl-post-actions">${
        past
          ? `<span class="howl-meta">${count} went</span>`
          : `<button class="howl-button is-secondary ${cls}" aria-pressed="${going}">${going ? icons.ok : ''}${going ? 'Going' : "I'm going"}</button><span class="howl-meta">${count} going</span>`
      }</div>
    </div>
  </article>`

const events = () =>
  group(
    'One event, every state',
    states([
      ['Normal', eventCard({ month: 'Nov', day: 7, title: 'Robotics club open lab', when: 'Tomorrow · 6 PM', place: 'Engineering Building II', going: false, count: 23 })],
      ['Hover', eventCard({ month: 'Nov', day: 7, title: 'Robotics club open lab', when: 'Tomorrow · 6 PM', place: 'Engineering Building II', going: false, count: 23, cls: 'is-hover' })],
      ['Going', eventCard({ month: 'Nov', day: 7, title: 'Robotics club open lab', when: 'Tomorrow · 6 PM', place: 'Engineering Building II', going: true, count: 24 })],
      ['Over', eventCard({ month: 'Nov', day: 2, title: 'Pumpkin carving on the Brickyard', when: 'Mon, Nov 2 · 4 PM', place: 'Brickyard', past: true, count: 64 })],
    ]),
  )

const buildMode = (theme) => {
  const mode = document.createElement('section')
  mode.className = 'mode howl-surface'
  mode.dataset.theme = theme
  mode.innerHTML = `
    <h2>${theme === 'light' ? 'Light' : 'Dark'}</h2>

    <h3>Colors</h3>
    <div class="swatches">
      ${colorNames
        .map(
          ([token, use]) => `
        <div class="swatch">
          <span class="swatch-chip" style="background: var(--color-${token})"></span>
          <div><strong>${token}</strong><span class="howl-meta">${use}</span><span class="howl-meta" data-value="${token}"></span></div>
        </div>`,
        )
        .join('')}
    </div>

    <h3>Text styles</h3>
    ${textStyles
      .map(
        ([name, cls, sample]) => `
      <div class="type-row"><span class="howl-meta">${name}</span><p class="${cls}" style="margin:0">${sample}</p></div>`,
      )
      .join('')}

    <h3>Spacing</h3>
    ${spaces
      .map(
        (s) => `
      <div class="space-row"><span class="howl-meta">${s}px</span><div class="space-bar" style="width: var(--space-${s})"></div></div>`,
      )
      .join('')}

    <h3>Corners</h3>
    <div class="radius-row">
      <div><div class="radius-box" style="border-radius: var(--radius-soft)"></div><span class="howl-meta">soft 12px</span></div>
      <div><div class="radius-box" style="border-radius: var(--radius-pill)"></div><span class="howl-meta">pill</span></div>
    </div>

    <h2 class="block-title">Building blocks</h2>

    <h3>Buttons</h3>
    ${buttons()}

    <h3>Write a post</h3>
    ${composerStates()}

    <h3>Post card</h3>
    ${postStates(posts)}

    <h3>Profile picture</h3>
    ${avatars()}

    <h3>Event card</h3>
    ${events()}

    <h3>Tabs</h3>
    <div class="tabs">
      <button class="howl-tab" aria-pressed="true">Latest</button>
      <button class="howl-tab" aria-pressed="false">Hot</button>
      <button class="howl-tab is-hover" aria-pressed="false">Following</button>
    </div>

    <h3>Notices</h3>
    <div class="notices">
      <div class="howl-notice is-success">${icons.ok}<span><strong>Posted.</strong></span></div>
      <div class="howl-notice is-warning">${icons.warn}<span><strong>12 characters left.</strong></span></div>
      <div class="howl-notice is-error">${icons.error}<span><strong>Couldn't post.</strong> Check your connection and try again.</span></div>
    </div>
  `
  return mode
}

const modes = document.getElementById('modes')
;['light', 'dark'].forEach((theme) => modes.append(buildMode(theme)))

modes.querySelectorAll('.mode').forEach((mode) => {
  const styles = getComputedStyle(mode)
  mode.querySelectorAll('[data-value]').forEach((el) => {
    el.textContent = styles.getPropertyValue(`--color-${el.dataset.value}`).trim() || ''
  })
})
