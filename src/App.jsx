import Icon from './Icon.jsx'
import Composer from './Composer.jsx'
import PostCard from './PostCard.jsx'
import { useEffect, useState } from 'react'
import { getPosts } from './postStore.js'

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
    setWriting(false)
    window.scrollTo({ top: 0 })
  }

  const spots = [...new Set((posts ?? []).map((post) => post.location).filter(Boolean))].slice(0, 8)

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
        <h2 className="feed-title">Latest posts</h2>
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
        ) : posts.length === 0 ? (
          <div className="howl-empty">
            <p>No posts yet. Be the first to post from campus.</p>
            <button className="howl-button" onClick={() => setWriting(true)}>
              Write a post
            </button>
          </div>
        ) : (
          <ol className="feed-list">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        )}
      </main>

      <Composer open={writing} onClose={() => setWriting(false)} onPosted={posted} />

      <aside className="side" aria-label="Campus spots">
        {spots.length > 0 && <h2 className="side-title">Spots</h2>}
        <div className="tag-row">
          {spots.map((spot) => (
            <button key={spot} className="howl-tag" aria-pressed="false">
              {spot}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default App
