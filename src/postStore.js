import { posts as samples } from './posts.js'

// Everything about loading and saving posts lives in this file.
// To connect a real database later, replace the bodies of getPosts and addPost.

const HOUR = 60 * 60 * 1000
const started = Date.now()

const toPost = (sample, index = 0) => ({
  id: sample.id,
  author: sample.author,
  location: sample.location,
  text: sample.text,
  howls: sample.howls,
  createdAt: new Date(started - sample.hoursAgo * HOUR - index * 1000).toISOString(),
})

export const MAX_LENGTH = 280
export const campusSpots = [...new Set(samples.map((sample) => sample.location).filter(Boolean))]

const STORAGE_KEY = 'howl.myPosts'

const readMine = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

const HOWLED_KEY = 'howl.howled'

const readHowled = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(HOWLED_KEY)) ?? [])
  } catch {
    return new Set()
  }
}

// Each post keeps its own count; the howled ids belong to this person, so one howl per post.
const withHowled = (list) => {
  const howled = readHowled()
  return list.map((post) => ({
    ...post,
    howled: howled.has(post.id),
    howls: post.howls + (howled.has(post.id) ? 1 : 0),
  }))
}

export async function setHowled(postId, howled) {
  const ids = readHowled()
  if (howled) ids.add(postId)
  else ids.delete(postId)
  localStorage.setItem(HOWLED_KEY, JSON.stringify([...ids]))
}

const sampleList = samples.map((sample, index) => toPost(sample, index))

// Layout previews: ?empty shows no posts, ?many shows 60 posts, ?slow and ?fail test loading.
const preview = new URLSearchParams(window.location.search)

const manyPosts = () =>
  Array.from({ length: 60 }, (_, i) => {
    const sample = samples[i % samples.length]
    return toPost({ ...sample, id: `many-${i}`, hoursAgo: i * 3 + 1 }, i)
  })

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const newestFirst = (list) =>
  [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

export async function getPosts() {
  if (preview.has('slow')) await wait(2500)
  if (preview.has('fail')) throw new Error('Could not load posts')
  if (preview.has('empty')) return []
  if (preview.has('many')) return withHowled(newestFirst(manyPosts()))
  return withHowled(newestFirst([...readMine(), ...sampleList]))
}

export async function addPost({ author = 'you', location = null, text }) {
  const clean = text.trim()
  if (clean.length === 0 || clean.length > MAX_LENGTH) throw new Error('Invalid post')
  const post = {
    id: `mine-${Date.now()}`,
    author,
    location: location || null,
    text: clean,
    howls: 0,
    howled: false,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...readMine()]))
  return post
}
