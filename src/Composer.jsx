import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { MAX_LENGTH, addPost, campusSpots } from './postStore.js'

const COUNTER_FROM = 40

function Composer({ open, onClose, onPosted }) {
  const dialog = useRef(null)
  const [text, setText] = useState('')
  const [spot, setSpot] = useState('')
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const left = MAX_LENGTH - text.length
  const empty = text.trim().length === 0
  const tooLong = left < 0
  const message = tooLong
    ? `That's ${-left} over. Cut ${-left} ${-left === 1 ? 'character' : 'characters'} to post.`
    : tried && empty
      ? 'Add a few words to post.'
      : null

  const submit = async (event) => {
    event.preventDefault()
    setTried(true)
    if (empty || tooLong) return
    setSaving(true)
    const post = await addPost({ text, location: spot })
    setSaving(false)
    setText('')
    setSpot('')
    setTried(false)
    onPosted(post)
  }

  return (
    <dialog
      ref={dialog}
      className="compose howl-surface"
      aria-label="Write a post"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
    >
      <form className="howl-composer" onSubmit={submit} noValidate>
        <div className="howl-avatar" aria-hidden="true">
          Y
        </div>
        <div>
          <textarea
            className="howl-composer-field"
            placeholder="What's happening on campus?"
            aria-label="Post text"
            aria-invalid={message ? 'true' : undefined}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <select
            className="howl-select"
            aria-label="Campus spot"
            value={spot}
            onChange={(event) => setSpot(event.target.value)}
          >
            <option value="">Add a spot (optional)</option>
            {campusSpots.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          {message && (
            <div className="howl-notice is-error compose-message" role="alert">
              <Icon name="error" />
              <span>{message}</span>
            </div>
          )}
          <div className="howl-composer-bar">
            <span
              className={`howl-meta${tooLong ? ' compose-over' : ''}`}
              aria-live="polite"
            >
              {left < 0 ? `${-left} over` : left <= COUNTER_FROM ? `${left} left` : ''}
            </span>
            <span className="compose-actions">
              <button type="button" className="howl-button is-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="howl-button" disabled={saving}>
                {saving ? 'Posting…' : 'Post'}
              </button>
            </span>
          </div>
        </div>
      </form>
    </dialog>
  )
}

export default Composer
