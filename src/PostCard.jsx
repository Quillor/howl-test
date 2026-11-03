import Icon from './Icon.jsx'

const isFresh = (time) => /^\d+[mh] ago$/.test(time)
const isLong = (text) => text.length > 160

function PostCard({ post }) {
  return (
    <article className="howl-post is-card">
      <div className="howl-avatar" aria-hidden="true">
        {post.author[0].toUpperCase()}
      </div>
      <div>
        <div className="howl-post-who">
          <strong>{post.author}</strong>
          {post.location && <span className="howl-meta">{post.location}</span>}
          <span className={`howl-meta${isFresh(post.time) ? ' is-fresh' : ''}`}>{post.time}</span>
        </div>
        <p className={`howl-post-text${isLong(post.text) ? ' is-clamped' : ''}`}>{post.text}</p>
        {isLong(post.text) && <button className="howl-more">Show more</button>}
        <div className="howl-post-actions">
          <button className="howl-pill" aria-pressed="false">
            <Icon name="howl" />
            Howl
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
