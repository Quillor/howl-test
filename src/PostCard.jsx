import { useState } from 'react'
import Icon from './Icon.jsx'
import { isFresh, timeAgo } from './timeAgo.js'

const isLong = (text) => text.length > 160

function PostCard({ post, onHowl, onReport }) {
  const [expanded, setExpanded] = useState(false)
  const [pop, setPop] = useState(false)
  const [asking, setAsking] = useState(false)
  const long = isLong(post.text)

  return (
    <article className="howl-post is-card">
      <div className="howl-avatar" aria-hidden="true">
        {post.author[0].toUpperCase()}
      </div>
      <div>
        <div className="howl-post-who">
          <strong>{post.author}</strong>
          {post.location && <span className="howl-meta">{post.location}</span>}
          <span className={`howl-meta${isFresh(post.createdAt) ? ' is-fresh' : ''}`}>
            {timeAgo(post.createdAt)}
          </span>
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
              setPop(!post.howled)
              onHowl(post.id)
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
          {post.author !== 'you' && !post.reported && (
            <button className="howl-more is-report" aria-expanded={asking} onClick={() => setAsking(!asking)}>
              Report
            </button>
          )}
          {post.reported && <span className="howl-meta">Reported</span>}
        </div>
        {asking && !post.reported && (
          <div className="howl-notice is-warning" role="group" aria-label="Report this post">
            <p>Report this post? We hide posts after 3 reports.</p>
            <div className="howl-post-actions">
              <button
                className="howl-button"
                onClick={() => {
                  setAsking(false)
                  onReport(post.id)
                }}
              >
                Report post
              </button>
              <button className="howl-button is-secondary" onClick={() => setAsking(false)}>
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
