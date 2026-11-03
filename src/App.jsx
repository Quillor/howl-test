import Icon from './Icon.jsx'
import PostCard from './PostCard.jsx'
import { posts as samplePosts } from './posts.js'

const navItems = [
  { label: 'Home', icon: 'home', current: true },
  { label: 'Spots', icon: 'pin' },
  { label: 'Write', icon: 'write', write: true },
  { label: 'Activity', icon: 'bell' },
  { label: 'Profile', icon: 'user' },
]

// Layout preview only: add ?empty to the address to see the empty state.
const showEmpty = new URLSearchParams(window.location.search).has('empty')

function App() {
  const posts = showEmpty ? [] : samplePosts
  const spots = [...new Set(samplePosts.map((post) => post.location).filter(Boolean))].slice(0, 8)

  return (
    <div className="app howl-surface">
      <div className="sidebar">
        <h1 className="brand howl-wordmark">Howl</h1>
        <nav className="nav" aria-label="Main">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label} className={item.write ? 'nav-item-write' : undefined}>
                <a
                  className={`nav-link${item.write ? ' is-write' : ''}`}
                  href="#"
                  aria-current={item.current ? 'page' : undefined}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main className="feed">
        {posts.length === 0 ? (
          <div className="howl-empty">
            <p>No posts yet. Be the first to post from campus.</p>
            <button className="howl-button">Write a post</button>
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

      <aside className="side" aria-label="Campus spots">
        <h2 className="side-title">Spots</h2>
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
