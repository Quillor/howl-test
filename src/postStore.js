import { comments as sampleComments, events as sampleEvents, posts as samples } from './posts.js'

// Everything about loading and saving posts, comments and events lives in this file.
// For now it all saves in this browser. To connect a real database later, change only this file.

export const MAX_LENGTH = 280
export const REPORT_LIMIT = 3

const HOUR = 60 * 60 * 1000
const started = Date.now()

const MINUTE = 60 * 1000
const postTime = (sample, index = 0) => started - sample.hoursAgo * HOUR - index * 1000

const toPost = (sample, index = 0) => ({
  id: sample.id,
  author: sample.author,
  authorId: null,
  text: sample.text,
  howls: sample.howls,
  comments: sampleComments[sample.id]?.length ?? 0,
  reports: sample.reports ?? 0,
  createdAt: new Date(postTime(sample, index)).toISOString(),
})

const read = (name, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(name)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (name, value) => localStorage.setItem(name, JSON.stringify(value))

const MINE_KEY = 'howl.myPosts'
const HOWLED_KEY = 'howl.howled'
const REPORTED_KEY = 'howl.reported'
const COMMENTS_KEY = 'howl.myComments'
const GOING_KEY = 'howl.going'

const sampleList = samples.map((sample, index) => toPost(sample, index))

// Each post keeps its own count; the howled and reported ids belong to this person.
const withMyMarks = (list) => {
  const howled = new Set(read(HOWLED_KEY, []))
  const reported = new Set(read(REPORTED_KEY, []))
  const myComments = read(COMMENTS_KEY, {})
  return list
    .map((post) => ({
      ...post,
      comments: post.comments + (myComments[post.id]?.length ?? 0),
      howled: howled.has(post.id),
      howls: post.howls + (howled.has(post.id) ? 1 : 0),
      reported: reported.has(post.id),
      reports: post.reports + (reported.has(post.id) ? 1 : 0),
    }))
    .filter((post) => post.reports < REPORT_LIMIT)
}

// Layout previews: ?empty shows no posts, ?many shows 60 posts, ?slow and ?fail test loading.
const preview = new URLSearchParams(window.location.search)

const manyPosts = () =>
  Array.from({ length: 60 }, (_, i) => {
    const sample = samples[i % samples.length]
    return toPost({ ...sample, id: `many-${i}`, hoursAgo: i * 3 + 1 }, i)
  })

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const newestFirst = (list) => [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

/* Posts */

export async function getPosts() {
  if (preview.has('slow')) await wait(2500)
  if (preview.has('fail')) throw new Error('Could not load posts')
  if (preview.has('empty')) return []
  if (preview.has('many')) return withMyMarks(newestFirst(manyPosts()))
  return withMyMarks(newestFirst([...read(MINE_KEY, []), ...sampleList]))
}

export async function addPost({ user, text }) {
  const clean = text.trim()
  if (clean.length === 0 || clean.length > MAX_LENGTH) throw new Error('Invalid post')
  const post = {
    id: `mine-${Date.now()}`,
    author: user.name,
    authorId: user.id,
    text: clean,
    howls: 0,
    comments: 0,
    reports: 0,
    createdAt: new Date().toISOString(),
  }
  write(MINE_KEY, [post, ...read(MINE_KEY, [])])
  return { ...post, howled: false, reported: false }
}

export async function deletePost(postId) {
  write(MINE_KEY, read(MINE_KEY, []).filter((post) => post.id !== postId))
}

export async function setHowled(postId, howled) {
  const ids = new Set(read(HOWLED_KEY, []))
  if (howled) ids.add(postId)
  else ids.delete(postId)
  write(HOWLED_KEY, [...ids])
}

// A post is hidden once it has 3 reports. Each person can report a post only once.
export async function reportPost(postId) {
  write(REPORTED_KEY, [...new Set([...read(REPORTED_KEY, []), postId])])
  return { hidden: !withMyMarks([...read(MINE_KEY, []), ...sampleList]).some((post) => post.id === postId) }
}

/* Comments */

const sampleCommentsFor = (postId) => {
  const sample = samples.find((post) => String(post.id) === String(postId))
  if (!sample) return []
  const at = postTime(sample, samples.indexOf(sample))
  return (sampleComments[sample.id] ?? []).map((comment, index) => ({
    id: `sample-${sample.id}-${index}`,
    author: comment.author,
    authorId: null,
    text: comment.text,
    createdAt: new Date(Math.min(at + comment.minutesAfter * MINUTE, Date.now())).toISOString(),
  }))
}

// Oldest first, so a conversation reads top to bottom.
export async function getComments(postId) {
  return [...sampleCommentsFor(postId), ...(read(COMMENTS_KEY, {})[postId] ?? [])]
}

export async function addComment({ postId, user, text }) {
  const clean = text.trim()
  if (clean.length === 0 || clean.length > MAX_LENGTH) throw new Error('Invalid comment')
  const comment = { id: `mine-${Date.now()}`, author: user.name, authorId: user.id, text: clean, createdAt: new Date().toISOString() }
  const all = read(COMMENTS_KEY, {})
  write(COMMENTS_KEY, { ...all, [postId]: [...(all[postId] ?? []), comment] })
  return comment
}

/* Events */

const DAY = 24 * HOUR
const sampleEventList = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const going = new Set(read(GOING_KEY, []))
  return sampleEvents.map((event) => ({
    id: event.id,
    title: event.title,
    place: event.place,
    details: event.details,
    startsAt: new Date(today.getTime() + event.daysFromNow * DAY + event.hour * HOUR).toISOString(),
    going: going.has(event.id),
    goingCount: event.going + (going.has(event.id) ? 1 : 0),
  }))
}

// Soonest first.
export async function getEvents() {
  if (preview.has('slow')) await wait(2500)
  if (preview.has('fail')) throw new Error('Could not load events')
  return sampleEventList()
}

export async function setGoing(eventId, going) {
  const ids = new Set(read(GOING_KEY, []))
  if (going) ids.add(eventId)
  else ids.delete(eventId)
  write(GOING_KEY, [...ids])
}

/* You */

// Accounts come later. Until then, everything you write is from "you".
export const me = { id: 'me', name: 'you' }
