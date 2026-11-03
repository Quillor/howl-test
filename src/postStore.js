import { createClient } from '@supabase/supabase-js'
import { posts as samples } from './posts.js'

// Everything about loading and saving posts, and signing in, lives in this file.
// With Supabase keys (the live site), posts and accounts are real.
// Without them (preview links and your laptop), Howl uses the sample posts and saves in this browser only.

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = url && key ? createClient(url, key) : null

export const usingSamples = supabase === null
export const MAX_LENGTH = 280
export const REPORT_LIMIT = 3

export const campusSpots = [
  ...new Set(samples.map((sample) => sample.location).filter(Boolean)),
  'Witherspoon Student Center',
  'Carmichael Gym',
  'Free Expression Tunnel',
]

const HOUR = 60 * 60 * 1000
const started = Date.now()

const toPost = (sample, index = 0) => ({
  id: sample.id,
  author: sample.author,
  authorId: null,
  location: sample.location,
  text: sample.text,
  howls: sample.howls,
  reports: sample.reports ?? 0,
  createdAt: new Date(started - sample.hoursAgo * HOUR - index * 1000).toISOString(),
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
const USER_KEY = 'howl.sampleUser'

const sampleList = samples.map((sample, index) => toPost(sample, index))

// Each post keeps its own count; the howled and reported ids belong to this person.
const withMyMarks = (list) => {
  const howled = new Set(read(HOWLED_KEY, []))
  const reported = new Set(read(REPORTED_KEY, []))
  return list
    .map((post) => ({
      ...post,
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

const fromRow = (row) => ({
  id: row.id,
  author: row.author,
  authorId: row.author_id,
  location: row.location,
  text: row.text,
  howls: row.howls,
  howled: row.howled,
  reports: 0,
  reported: row.reported,
  createdAt: row.created_at,
})

const check = ({ data, error }) => {
  if (error) throw error
  return data
}

/* Posts */

export async function getPosts() {
  if (preview.has('slow')) await wait(2500)
  if (preview.has('fail')) throw new Error('Could not load posts')
  if (preview.has('empty')) return []
  if (supabase) {
    // The feed view already hides posts with 3 or more reports.
    const rows = check(await supabase.from('feed').select('*').order('created_at', { ascending: false }))
    return rows.map(fromRow)
  }
  if (preview.has('many')) return withMyMarks(newestFirst(manyPosts()))
  return withMyMarks(newestFirst([...read(MINE_KEY, []), ...sampleList]))
}

export async function addPost({ user, location = null, text }) {
  const clean = text.trim()
  if (clean.length === 0 || clean.length > MAX_LENGTH) throw new Error('Invalid post')
  if (supabase) {
    const row = check(
      await supabase.from('posts').insert({ text: clean, location: location || null }).select('id, created_at').single(),
    )
    return { id: row.id, author: user.name, authorId: user.id, location: location || null, text: clean, howls: 0, howled: false, reports: 0, reported: false, createdAt: row.created_at }
  }
  const post = {
    id: `mine-${Date.now()}`,
    author: user.name,
    authorId: user.id,
    location: location || null,
    text: clean,
    howls: 0,
    reports: 0,
    createdAt: new Date().toISOString(),
  }
  write(MINE_KEY, [post, ...read(MINE_KEY, [])])
  return { ...post, howled: false, reported: false }
}

export async function deletePost(postId) {
  if (supabase) return check(await supabase.from('posts').delete().eq('id', postId))
  write(MINE_KEY, read(MINE_KEY, []).filter((post) => post.id !== postId))
}

export async function setHowled(postId, howled) {
  if (supabase) {
    const howls = supabase.from('howls')
    return check(howled ? await howls.insert({ post_id: postId }) : await howls.delete().eq('post_id', postId))
  }
  const ids = new Set(read(HOWLED_KEY, []))
  if (howled) ids.add(postId)
  else ids.delete(postId)
  write(HOWLED_KEY, [...ids])
}

// A post is hidden once it has 3 reports. Each person can report a post only once.
export async function reportPost(postId) {
  if (supabase) {
    check(await supabase.from('reports').insert({ post_id: postId }))
    const still = check(await supabase.from('feed').select('id').eq('id', postId))
    return { hidden: still.length === 0 }
  }
  write(REPORTED_KEY, [...new Set([...read(REPORTED_KEY, []), postId])])
  return { hidden: !withMyMarks([...read(MINE_KEY, []), ...sampleList]).some((post) => post.id === postId) }
}

/* Accounts */

const toUser = async (authUser) => {
  if (!authUser) return null
  const profile = check(await supabase.from('profiles').select('name').eq('id', authUser.id).maybeSingle())
  return { id: authUser.id, email: authUser.email, name: profile?.name ?? authUser.user_metadata?.name ?? 'student' }
}

export async function getUser() {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    return toUser(data.session?.user)
  }
  return read(USER_KEY, null)
}

// Calls back with the signed-in person (or null) whenever that changes, e.g. after the email link opens Howl.
export function onUserChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(async () => callback(await toUser(session?.user)), 0)
  })
  return () => data.subscription.unsubscribe()
}

// Live site: emails a sign-in link. Samples: signs in right away, since there's no email to send.
export async function sendSignInLink({ email, name }) {
  if (supabase) {
    check(
      await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin, data: { name } },
      }),
    )
    return { emailed: true }
  }
  const user = { id: 'me', email, name }
  write(USER_KEY, user)
  return { emailed: false, user }
}

export async function signOut() {
  if (supabase) return check(await supabase.auth.signOut())
  localStorage.removeItem(USER_KEY)
}
