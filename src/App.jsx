import Icon from './Icon.jsx'
import Composer from './Composer.jsx'
import PostCard from './PostCard.jsx'
import SpotTags from './SpotTags.jsx'
import { useEffect, useState } from 'react'
import { campusSpots, getPosts, setHowled } from './postStore.js'

const navItems = [
  { label: 'Home', icon: 'home', current: true },
  { label: 'Spots', icon: 'pin' },
  { label: 'Write', icon: 'write', write: true },
  { label: 'Activity', icon: 'bell' },
  { label: 'Profile', icon: 'user' },
]

function App() {
  const [posts, setPosts] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [writing, setWriting] = useState(false)
  const [spot, setSpot] = useState(null)

  useEffect(() => {
    let current = true
    getPosts()
      .then((loaded) => current && (setFailed(false), setPosts(loaded)))
      .catch(() => current && setFailed(true))
    return () => {
      current = false
    }
  }, [attempt])

  const retry = () => {
    setFailed(false)
    setPosts(null)
    setAttempt(attempt + 1)
  }

  const posted = (post) => {
    setPosts((current) => [post, ...(current ?? [])])
    if (spot && post.location !== spot) setSpot(null)
    setWriting(false)
    window.scrollTo({ top: 0 })
  }

  const toggleHowl = async (id) => {
    const target = posts.find((post) => post.id === id)
    const next = !target.howled
    const apply = (howled) =>
      setPosts((current) =>
        current.map((post) =>
          post.id === id ? { ...post, howled, howls: post.howls + (howled ? 1 : -1) } : post,
        ),
      )
    apply(next)
    try {
      await setHowled(id, next)
    } catch {
      apply(!next)
    }
  }

  const shown = spot ? (posts ?? []).filter((post) => post.location === spot) : posts

  return (
    <div className="app howl-surface">
      <div className="sidebar">
        <h1 className="brand howl-wordmark">Howl</h1>
        <nav className="nav" aria-label="Main">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label} className={item.write ? 'nav-item-write' : undefined}>
                {item.write ? (
                  <button className="nav-link is-write" onClick={() => setWriting(true)}>
                    <Icon name={item.icon} />
                    {item.label}
                  </button>
                ) : (
                  <a
                    className="nav-link"
                    href="#"
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main className="feed">
        <h2 className="feed-title">{spot ?? 'Latest posts'}</h2>
        <SpotTags className="spot-row" spots={campusSpots} selected={spot} onSelect={setSpot} />
        {failed ? (
          <div className="howl-empty" role="alert">
            <p>Couldn't load posts. Check your connection and try again.</p>
            <button className="howl-button" onClick={retry}>
              Try again
            </button>
          </div>
        ) : posts === null ? (
          <p className="howl-meta feed-status" role="status">
            Loading posts…
          </p>
        ) : shown.length === 0 ? (
          <div className="howl-empty">
            <p>
              {spot ? `No posts from ${spot} yet. Be the first.` : 'No posts yet. Be the first to post from campus.'}
            </p>
            <button className="howl-button" onClick={() => setWriting(true)}>
              Write a post
            </button>
          </div>
        ) : (
          <ol className="feed-list">
            {shown.map((post) => (
              <li key={post.id}>
                <PostCard post={post} onHowl={toggleHowl} />
              </li>
            ))}
          </ol>
        )}
      </main>

      <Composer open={writing} initialSpot={spot} onClose={() => setWriting(false)} onPosted={posted} />

      <aside className="side" aria-label="Campus spots">
        <h2 className="side-title">Spots</h2>
        <SpotTags className="tag-row" spots={campusSpots} selected={spot} onSelect={setSpot} />
      </aside>
    </div>
  )
}

export default App
