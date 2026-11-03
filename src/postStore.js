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
  if (preview.has('many')) return newestFirst(manyPosts())
  return newestFirst([...readMine(), ...sampleList])
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
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...readMine()]))
  return post
}
