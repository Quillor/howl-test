import Icon from './Icon.jsx'
import Composer from './Composer.jsx'
import PostCard from './PostCard.jsx'
import SignIn from './SignIn.jsx'
import SpotTags from './SpotTags.jsx'
import { useEffect, useState } from 'react'
import {
  campusSpots,
  deletePost,
  getPosts,
  getUser,
  onUserChange,
  reportPost,
  setHowled,
  signOut,
  usingSamples,
} from './postStore.js'

const navItems = [
  { label: 'Home', icon: 'home', view: 'home' },
  { label: 'Spots', icon: 'pin', view: 'spots' },
  { label: 'Write', icon: 'write', write: true },
  { label: 'Alerts', icon: 'bell', view: 'alerts' },
  { label: 'Profile', icon: 'user', view: 'profile' },
]

function App() {
  const [posts, setPosts] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [writing, setWriting] = useState(false)
  const [spot, setSpot] = useState(null)
  const [view, setView] = useState('home')
  const [user, setUser] = useState(null)
  const [signIn, setSignIn] = useState(null)

  useEffect(() => {
    let current = true
    getPosts()
      .then((loaded) => current && (setFailed(false), setPosts(loaded)))
      .catch(() => current && setFailed(true))
    return () => {
      current = false
    }
  }, [attempt, user?.id])

  useEffect(() => {
    getUser().then(setUser)
    return onUserChange(setUser)
  }, [])

  const retry = () => {
    setFailed(false)
    setPosts(null)
    setAttempt(attempt + 1)
  }

  // Runs `action` if signed in; otherwise asks to sign in first and says why.
  const needsAccount = (reason, action) => {
    if (user) {
      action()
      return true
    }
    setSignIn(reason)
    return false
  }

  const startWriting = () => needsAccount('Sign in to post', () => setWriting(true))

  const go = (next) => {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  const posted = (post) => {
    setPosts((current) => [post, ...(current ?? [])])
    if (spot && post.location !== spot) setSpot(null)
    setWriting(false)
    go('home')
  }

  const toggleHowl = (id) =>
    needsAccount('Sign in to howl', async () => {
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
    })

  const report = (id) =>
    needsAccount('Sign in to report', async () => {
      setPosts((current) => current.map((post) => (post.id === id ? { ...post, reported: true } : post)))
      const { hidden } = await reportPost(id)
      if (hidden) setPosts((current) => current.filter((post) => post.id !== id))
    })

  const remove = async (id) => {
    const before = posts
    setPosts((current) => current.filter((post) => post.id !== id))
    try {
      await deletePost(id)
    } catch {
      setPosts(before)
    }
  }

  const pickSpot = (next) => {
    setSpot(next)
    go('home')
  }

  const leave = async () => {
    await signOut()
    setUser(null)
    go('home')
  }

  const isMine = (post) => Boolean(user) && post.authorId === user.id
  const mine = (posts ?? []).filter(isMine)
  const shown = spot ? (posts ?? []).filter((post) => post.location === spot) : posts
  const spotCounts = Object.fromEntries(
    campusSpots.map((name) => [name, (posts ?? []).filter((post) => post.location === name).length]),
  )

  const postList = (list) => (
    <ol className="feed-list">
      {list.map((post) => (
        <li key={post.id}>
          <PostCard post={post} mine={isMine(post)} onHowl={toggleHowl} onReport={report} onDelete={remove} />
        </li>
      ))}
    </ol>
  )

  const home = (
    <>
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
          <p>{spot ? `No posts from ${spot} yet. Be the first.` : 'No posts yet. Be the first to post from campus.'}</p>
          <button className="howl-button" onClick={startWriting}>
            Write a post
          </button>
        </div>
      ) : (
        postList(shown)
      )}
    </>
  )

  const spots = (
    <>
      <h2 className="page-title">Spots</h2>
      <p className="howl-meta page-lead">Pick a spot to see what's happening there.</p>
      <ul className="spot-list">
        {campusSpots.map((name) => (
          <li key={name}>
            <button className="spot-link" onClick={() => pickSpot(name)}>
              <Icon name="pin" />
              <span className="spot-name">{name}</span>
              <span className="howl-meta howl-count">
                {spotCounts[name] === 1 ? '1 post' : `${spotCounts[name]} posts`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )

  const alerts = (
    <>
      <h2 className="page-title">Alerts</h2>
      {user && mine.some((post) => post.howls > 0) ? (
        <ul className="alert-list">
          {mine
            .filter((post) => post.howls > 0)
            .map((post) => (
              <li key={post.id} className="alert-item">
                <Icon name="howl" />
                <p>
                  <strong>{post.howls === 1 ? '1 howl' : `${post.howls} howls`}</strong> on your post “
                  {post.text.length > 60 ? `${post.text.slice(0, 60)}…` : post.text}”
                </p>
              </li>
            ))}
        </ul>
      ) : (
        <div className="howl-empty">
          <p>
            {user
              ? 'When people howl at your posts, you’ll see it here.'
              : 'Sign in to see when people howl at your posts.'}
          </p>
          {user ? (
            <button className="howl-button" onClick={startWriting}>
              Write a post
            </button>
          ) : (
            <button className="howl-button" onClick={() => setSignIn('Sign in to Howl')}>
              Sign in
            </button>
          )}
        </div>
      )}
    </>
  )

  const profile = user ? (
    <>
      <div className="profile-head">
        <div className="howl-avatar is-large" aria-hidden="true">
          {user.name[0].toUpperCase()}
        </div>
        <div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="howl-meta">{user.email}</p>
        </div>
        <button className="howl-button is-secondary profile-out" onClick={leave}>
          Sign out
        </button>
      </div>
      <h3 className="section-title">Your posts</h3>
      {mine.length === 0 ? (
        <div className="howl-empty">
          <p>You haven't posted yet. Say what's happening on campus.</p>
          <button className="howl-button" onClick={startWriting}>
            Write a post
          </button>
        </div>
      ) : (
        postList(mine)
      )}
    </>
  ) : (
    <>
      <h2 className="page-title">Profile</h2>
      <div className="howl-empty">
        <p>Sign in to post, howl and keep track of your posts. Reading Howl stays open to everyone.</p>
        <button className="howl-button" onClick={() => setSignIn('Sign in to Howl')}>
          Sign in
        </button>
      </div>
    </>
  )

  const pages = { home, spots, alerts, profile }

  return (
    <div className="app howl-surface">
      <div className="sidebar">
        <h1 className="brand howl-wordmark">
          <button className="brand-link" onClick={() => pickSpot(null)}>
            Howl
          </button>
        </h1>
        <nav className="nav" aria-label="Main">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.label} className={item.write ? 'nav-item-write' : undefined}>
                {item.write ? (
                  <button className="nav-link is-write" onClick={startWriting}>
                    <Icon name={item.icon} />
                    {item.label}
                  </button>
                ) : (
                  <button
                    className="nav-link"
                    aria-current={view === item.view ? 'page' : undefined}
                    onClick={() => go(item.view)}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main className="feed">
        {usingSamples && (
          <p className="preview-note howl-meta" role="note">
            <strong>Preview</strong> Sample posts. Real ones aren't touched.
          </p>
        )}
        {pages[view]}
      </main>

      <Composer
        open={writing}
        user={user}
        initialSpot={spot}
        onClose={() => setWriting(false)}
        onPosted={posted}
      />
      <SignIn
        open={signIn !== null}
        reason={signIn}
        onClose={() => setSignIn(null)}
        onSignedIn={(next) => {
          setUser(next)
          setSignIn(null)
        }}
      />

      <aside className="side" aria-label="Campus spots">
        <h2 className="side-title">Spots</h2>
        <SpotTags className="tag-row" spots={campusSpots} selected={spot} onSelect={pickSpot} />
        <div className="side-account">
          {user ? (
            <p className="howl-meta">
              Signed in as <strong>{user.name}</strong>
            </p>
          ) : (
            <>
              <p className="howl-meta">Sign in to post and howl. No password needed.</p>
              <button className="howl-button is-secondary" onClick={() => setSignIn('Sign in to Howl')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

export default App
