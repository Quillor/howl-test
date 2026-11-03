import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { isFresh, timeAgo } from './timeAgo.js'

const isLong = (text) => text.length > 160

// `mine` posts get Delete in the "…" menu; everyone else's get Report.
function PostCard({ post, mine, onHowl, onReport, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [pop, setPop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [asking, setAsking] = useState(null)
  const menu = useRef(null)
  const long = isLong(post.text)

  useEffect(() => {
    if (!menuOpen) return
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !menu.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [menuOpen])

  const choose = (action) => {
    setMenuOpen(false)
    setAsking(action)
  }

  return (
    <article className="howl-post is-card">
      <div className="howl-avatar" aria-hidden="true">
        {post.author[0].toUpperCase()}
      </div>
      <div>
        <div className="howl-post-who">
          <strong>{post.author}</strong>
          {mine && <span className="howl-meta">You</span>}
          {post.location && <span className="howl-meta">{post.location}</span>}
          <span className={`howl-meta${isFresh(post.createdAt) ? ' is-fresh' : ''}`}>
            {timeAgo(post.createdAt)}
          </span>
          {!(post.reported && !mine) && (
            <div className="post-menu" ref={menu}>
              <button
                className="howl-icon-button"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Icon name="more" />
              </button>
              {menuOpen && (
                <div className="post-menu-list" role="menu">
                  {mine ? (
                    <button role="menuitem" className="post-menu-item is-danger" onClick={() => choose('delete')}>
                      <Icon name="trash" />
                      Delete post
                    </button>
                  ) : (
                    <button role="menuitem" className="post-menu-item" onClick={() => choose('report')}>
                      <Icon name="flag" />
                      Report post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <p className={`howl-post-text${long && !expanded ? ' is-clamped' : ''}`}>{post.text}</p>
        {long && (
          <button className="howl-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <div className="howl-post-actions">
          <button
            className={`howl-pill${pop ? ' is-popping' : ''}`}
            aria-pressed={post.howled}
            onClick={() => {
              if (onHowl(post.id)) setPop(!post.howled)
            }}
            onAnimationEnd={() => setPop(false)}
          >
            <Icon name="howl" />
            {post.howled ? 'Howled' : 'Howl'}
            <span className="howl-count">{post.howls}</span>
          </button>
          <button className="howl-icon-button" aria-label="Reply">
            <Icon name="reply" />
          </button>
          <button className="howl-icon-button" aria-label="Share">
            <Icon name="share" />
          </button>
          {post.reported && <span className="howl-meta">Reported</span>}
        </div>
        {asking && (
          <div className="howl-notice is-warning" role="group" aria-label={asking === 'delete' ? 'Delete this post' : 'Report this post'}>
            <p>
              {asking === 'delete'
                ? 'Delete this post? This can’t be undone.'
                : 'Report this post? We hide posts after 3 reports.'}
            </p>
            <div className="howl-post-actions">
              <button
                className="howl-button"
                onClick={() => {
                  setAsking(null)
                  if (asking === 'delete') onDelete(post.id)
                  else onReport(post.id)
                }}
              >
                {asking === 'delete' ? 'Delete post' : 'Report post'}
              </button>
              <button className="howl-button is-secondary" onClick={() => setAsking(null)}>
                Keep it
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export default PostCard
