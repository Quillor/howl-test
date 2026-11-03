import { useState } from 'react'
import Icon from './Icon.jsx'
import { isFresh, timeAgo } from './timeAgo.js'

const isLong = (text) => text.length > 160

function PostCard({ post, onHowl }) {
  const [expanded, setExpanded] = useState(false)
  const [pop, setPop] = useState(false)
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
        </div>
      </div>
    </article>
  )
}

export default PostCard
