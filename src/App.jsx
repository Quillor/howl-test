import Icon from './Icon.jsx'
import Composer from './Composer.jsx'
import PostCard from './PostCard.jsx'
import PostPage from './PostPage.jsx'
import SignIn from './SignIn.jsx'
import { ComingUp, EventsPage } from './Events.jsx'
import { Link, navigate, usePath } from './router.jsx'
import { share } from './share.js'
import { useEffect, useRef, useState } from 'react'
import {
  deletePost,
  getEvents,
  getPosts,
  getUser,
  onUserChange,
  reportPost,
  setGoing,
  setHowled,
  signOut,
  usingSamples,
} from './postStore.js'

const navItems = [
  { label: 'Home', icon: 'home', to: '/' },
  { label: 'Events', icon: 'calendar', to: '/events' },
  { label: 'Write', icon: 'write', write: true },
  { label: 'Alerts', icon: 'bell', to: '/alerts' },
  { label: 'Profile', icon: 'user', to: '/profile' },
]

const titles = { '/': 'Howl', '/events': 'Events · Howl', '/alerts': 'Alerts · Howl', '/profile': 'Profile · Howl' }

function App() {
  const path = usePath()
  const [posts, setPosts] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [events, setEvents] = useState(null)
  const [eventsFailed, setEventsFailed] = useState(false)
  const [eventsAttempt, setEventsAttempt] = useState(0)
  const [writing, setWriting] = useState(false)
  const [user, setUser] = useState(null)
  const [signIn, setSignIn] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

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
    let current = true
    getEvents()
      .then((loaded) => current && (setEventsFailed(false), setEvents(loaded)))
      .catch(() => current && setEventsFailed(true))
    return () => {
      current = false
    }
  }, [eventsAttempt, user?.id])

  useEffect(() => {
    getUser().then(setUser)
    return onUserChange(setUser)
  }, [])

  const postId = path.startsWith('/post/') ? decodeURIComponent(path.slice('/post/'.length)) : null
  const page = postId !== null ? 'post' : ({ '/': 'home', '/events': 'events', '/alerts': 'alerts', '/profile': 'profile' }[path] ?? 'missing')
  const openPost = postId !== null ? (posts ?? []).find((post) => String(post.id) === postId) : null

  useEffect(() => {
    document.title = page === 'post' && openPost ? `${openPost.author} on Howl` : (titles[path] ?? 'Howl')
  }, [page, path, openPost])

  const say = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }

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

  const posted = (post) => {
    setPosts((current) => [post, ...(current ?? [])])
    setWriting(false)
    navigate('/')
    say('Posted')
  }

  const updatePost = (id, change) =>
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...change(post) } : post)))

  const toggleHowl = (id) =>
    needsAccount('Sign in to howl', async () => {
      const next = !posts.find((post) => post.id === id).howled
      const apply = (howled) => updatePost(id, (post) => ({ howled, howls: post.howls + (howled ? 1 : -1) }))
      apply(next)
      try {
        await setHowled(id, next)
      } catch {
        apply(!next)
      }
    })

  const report = (id) =>
    needsAccount('Sign in to report', async () => {
      updatePost(id, () => ({ reported: true }))
      const { hidden } = await reportPost(id)
      if (hidden) setPosts((current) => current.filter((post) => post.id !== id))
      say(hidden ? 'Reported. The post is hidden now.' : 'Reported. Thanks for keeping Howl friendly.')
    })

  const remove = async (id) => {
    const before = posts
    setPosts((current) => current.filter((post) => post.id !== id))
    if (page === 'post') navigate('/')
    try {
      await deletePost(id)
      say('Post deleted')
    } catch {
      setPosts(before)
      say("Couldn't delete. Try again.")
    }
  }

  const sharePost = async (post) => {
    const result = await share({ title: `${post.author} on Howl`, text: post.text, path: `/post/${post.id}` })
    if (result === 'copied') say('Link copied')
    if (result === 'failed') say("Couldn't share. Copy the address from your browser.")
  }

  const toggleGoing = (id) =>
    needsAccount("Sign in to say you're going", async () => {
      const next = !events.find((event) => event.id === id).going
      const apply = (going) =>
        setEvents((current) =>
          current.map((event) => (event.id === id ? { ...event, going, goingCount: event.goingCount + (going ? 1 : -1) } : event)),
        )
      apply(next)
      try {
        await setGoing(id, next)
      } catch {
        apply(!next)
        say("Couldn't save that. Try again.")
      }
    })

  const leave = async () => {
    await signOut()
    setUser(null)
    navigate('/')
  }

  const isMine = (post) => Boolean(user) && post.authorId === user.id
  const mine = (posts ?? []).filter(isMine)
  const cardProps = { onHowl: toggleHowl, onReport: report, onDelete: remove, onShare: sharePost }

  const postList = (list) => (
    <ol className="feed-list">
      {list.map((post, index) => (
        <li key={post.id} className="howl-rise" style={{ '--i': index }}>
          <PostCard post={post} mine={isMine(post)} {...cardProps} />
        </li>
      ))}
    </ol>
  )

  const home = (
    <>
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
          <button className="howl-button" onClick={startWriting}>
            Write a post
          </button>
        </div>
      ) : (
        postList(posts)
      )}
    </>
  )

  const alerts = (
    <>
      <h2 className="page-title">Alerts</h2>
      {user && mine.some((post) => post.howls > 0 || post.comments > 0) ? (
        <ul className="alert-list">
          {mine
            .filter((post) => post.howls > 0 || post.comments > 0)
            .map((post, index) => (
              <li key={post.id} className="howl-rise" style={{ '--i': index }}>
                <Link to={`/post/${post.id}`} className="alert-item">
                  <Icon name={post.comments > 0 ? 'reply' : 'howl'} />
                  <p>
                    <strong>
                      {[
                        post.howls > 0 && (post.howls === 1 ? '1 howl' : `${post.howls} howls`),
                        post.comments > 0 && (post.comments === 1 ? '1 comment' : `${post.comments} comments`),
                      ]
                        .filter(Boolean)
                        .join(' and ')}
                    </strong>{' '}
                    on your post “{post.text.length > 60 ? `${post.text.slice(0, 60)}…` : post.text}”
                  </p>
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <div className="howl-empty">
          <p>
            {user
              ? 'When people howl at or comment on your posts, you’ll see it here.'
              : 'Sign in to see when people howl at or comment on your posts.'}
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
        <p>Sign in to post, howl, comment and keep track of your posts. Reading Howl stays open to everyone.</p>
        <button className="howl-button" onClick={() => setSignIn('Sign in to Howl')}>
          Sign in
        </button>
      </div>
    </>
  )

  const missing = (
    <div className="howl-empty">
      <h2 className="page-title">Page not found</h2>
      <p>There's nothing at this address.</p>
      <Link to="/" className="howl-button">
        Back to the feed
      </Link>
    </div>
  )

  const content = {
    home,
    events: <EventsPage events={events} failed={eventsFailed} onRetry={() => (setEvents(null), setEventsAttempt(eventsAttempt + 1))} onGoing={toggleGoing} />,
    alerts,
    profile,
    post: (
      <PostPage
        key={postId}
        post={openPost}
        loading={posts === null && !failed}
        user={user}
        isMine={isMine}
        cardProps={cardProps}
        askToSignIn={needsAccount}
        onCommented={(id) => updatePost(id, (post) => ({ comments: post.comments + 1 }))}
      />
    ),
    missing,
  }[page]

  return (
    <div className="app howl-surface">
      <div className="sidebar">
        <h1 className="brand howl-wordmark">
          <Link to="/" className="brand-link">
            Howl
          </Link>
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
                  <Link to={item.to} className="nav-link" aria-current={path === item.to ? 'page' : undefined}>
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
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
        <div key={page === 'post' ? `post-${postId}` : page} className="page">
          {content}
        </div>
      </main>

      <Composer open={writing} user={user} onClose={() => setWriting(false)} onPosted={posted} />
      <SignIn
        open={signIn !== null}
        reason={signIn}
        onClose={() => setSignIn(null)}
        onSignedIn={(next) => {
          setUser(next)
          setSignIn(null)
          say(`Signed in as ${next.name}`)
        }}
      />

      <aside className="side" aria-label="Coming up and account">
        <ComingUp events={events} />
        <div className="side-account">
          {user ? (
            <p className="howl-meta">
              Signed in as <strong>{user.name}</strong>
            </p>
          ) : (
            <>
              <p className="howl-meta">Sign in to post, howl and comment. No password needed.</p>
              <button className="howl-button is-secondary" onClick={() => setSignIn('Sign in to Howl')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </aside>

      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast} className="howl-toast">
            <Icon name="ok" />
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
