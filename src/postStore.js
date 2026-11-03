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

let saved = samples.map((sample, index) => toPost(sample, index))

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
  return newestFirst(saved)
}

export async function addPost({ author, location = null, text }) {
  const post = {
    id: `new-${Date.now()}`,
    author,
    location,
    text,
    howls: 0,
    createdAt: new Date().toISOString(),
  }
  saved = [post, ...saved]
  return post
}
