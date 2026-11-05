import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import PostCard from './PostCard.jsx'
import { Link } from './router.jsx'
import { MAX_LENGTH, addComment, getComments } from './postStore.js'
import { timeAgo } from './timeAgo.js'

const COUNTER_FROM = 40

// A post's own page: the whole post, its comments, and a box to add one.
// `askToSignIn(reason, action)` runs the action if someone is signed in, or asks them to sign in.
function PostPage({ post, loading, user, isMine, cardProps, askToSignIn, onCommented }) {
  const [comments, setComments] = useState(null)
  const [failed, setFailed] = useState(false)
  const [text, setText] = useState('')
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [fresh, setFresh] = useState(null)
  const field = useRef(null)
  const postId = post?.id

  useEffect(() => {
    if (postId === undefined) return
    let current = true
    getComments(postId)
      .then((loaded) => current && setComments(loaded))
      .catch(() => current && setFailed(true))
    return () => {
      current = false
    }
  }, [postId])

  if (loading) {
    return (
      <p className="howl-meta feed-status" role="status">
        Loading post…
      </p>
    )
  }

  if (!post) {
    return (
      <>
        <BackLink />
        <div className="howl-empty">
          <p>This post isn't here anymore. It may have been deleted or hidden after reports.</p>
          <Link to="/" className="howl-button">
            Back to the feed
          </Link>
        </div>
      </>
    )
  }

  const left = MAX_LENGTH - text.length
  const empty = text.trim().length === 0
  const message = saveFailed
    ? "Couldn't add your comment. Check your connection and try again."
    : left < 0
      ? `That's ${-left} over. Cut ${-left} ${-left === 1 ? 'character' : 'characters'} to comment.`
      : tried && empty
        ? 'Add a few words to comment.'
        : null

  const submit = (event) => {
    event.preventDefault()
    setTried(true)
    if (empty || left < 0) return
    askToSignIn('Sign in to comment', async () => {
      setSaving(true)
      setSaveFailed(false)
      try {
        const comment = await addComment({ postId: post.id, user, text })
        setComments((current) => [...(current ?? []), comment])
        setFresh(comment.id)
        setText('')
        setTried(false)
        onCommented(post.id)
      } catch {
        setSaveFailed(true)
      }
      setSaving(false)
    })
  }

  return (
    <>
      <BackLink />
      <div className="howl-rise">
        <PostCard post={post} mine={isMine(post)} full {...cardProps} />
      </div>

      <section className="comments" aria-labelledby="comments-title">
        <h2 id="comments-title" className="section-title">
          Comments
        </h2>

        <form className="comment-form howl-rise" style={{ '--i': 1 }} onSubmit={submit} noValidate>
          <div className="howl-avatar" aria-hidden="true">
            {user ? user.name[0].toUpperCase() : <Icon name="user" />}
          </div>
          <div>
            <textarea
              ref={field}
              className="howl-composer-field comment-field"
              placeholder={`Reply to ${post.author}`}
              aria-label="Your comment"
              aria-invalid={message ? 'true' : undefined}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            {message && (
              <div className="howl-notice is-error compose-message" role="alert">
                <Icon name="error" />
                <span>{message}</span>
              </div>
            )}
            <div className="howl-composer-bar">
              <span className={`howl-meta${left < 0 ? ' compose-over' : ''}`} aria-live="polite">
                {left < 0 ? `${-left} over` : left <= COUNTER_FROM ? `${left} left` : ''}
              </span>
              <button type="submit" className="howl-button" disabled={saving}>
                {saving ? 'Sending…' : 'Comment'}
              </button>
            </div>
          </div>
        </form>

        {failed ? (
          <div className="howl-empty" role="alert">
            <p>Couldn't load comments. Check your connection and refresh the page.</p>
          </div>
        ) : comments === null ? (
          <p className="howl-meta feed-status" role="status">
            Loading comments…
          </p>
        ) : comments.length === 0 ? (
          <div className="howl-empty">
            <p>No comments yet. Start the conversation.</p>
            <button className="howl-button is-secondary" onClick={() => field.current?.focus()}>
              Write a comment
            </button>
          </div>
        ) : (
          <ol className="comment-list">
            {comments.map((comment, index) => (
              <li
                key={comment.id}
                className={`howl-comment howl-rise${comment.id === fresh ? ' is-fresh' : ''}`}
                style={{ '--i': comment.id === fresh ? 0 : index + 2 }}
              >
                <div className="howl-avatar" aria-hidden="true">
                  {comment.author[0].toUpperCase()}
                </div>
                <div>
                  <div className="howl-post-who">
                    <strong>{comment.author}</strong>
                    {user && comment.authorId === user.id && <span className="howl-meta">You</span>}
                    <span className="howl-meta">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}

function BackLink() {
  return (
    <Link
      to="/"
      className="back-link"
      onClick={(event) => {
        // Came from inside Howl? Go back, so the feed keeps its scroll position.
        if (window.history.state?.inApp) {
          event.preventDefault()
          window.history.back()
        }
      }}
    >
      <Icon name="back" />
      Back
    </Link>
  )
}

export default PostPage
