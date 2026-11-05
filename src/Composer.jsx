import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { MAX_FILE_MB, preparePhoto } from './photo.js'
import { MAX_LENGTH, addPost } from './postStore.js'

const COUNTER_FROM = 40

const photoProblems = {
  'not-image': 'That file isn’t a photo. Choose a JPEG, PNG or HEIC photo.',
  'too-big': `That photo is over ${MAX_FILE_MB} MB. Choose a smaller one.`,
  unreadable: 'Couldn’t open that photo. Try a different one.',
}

function Composer({ open, user, onClose, onPosted }) {
  const dialog = useRef(null)
  const picker = useRef(null)
  const altField = useRef(null)
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null)
  const [alt, setAlt] = useState('')
  const [photoProblem, setPhotoProblem] = useState(null)
  const [preparing, setPreparing] = useState(false)
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(null)

  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const left = MAX_LENGTH - text.length
  const empty = text.trim().length === 0
  const tooLong = left < 0
  const missingAlt = photo && alt.trim().length === 0
  const message = failed
    ? failed
    : tooLong
      ? `That's ${-left} over. Cut ${-left} ${-left === 1 ? 'character' : 'characters'} to post.`
      : tried && empty
        ? 'Add a few words to post.'
        : null

  const clearPhoto = () => {
    if (photo) URL.revokeObjectURL(photo.previewUrl)
    setPhoto(null)
    setAlt('')
    setPhotoProblem(null)
  }

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoProblem(null)
    setPreparing(true)
    try {
      const ready = await preparePhoto(file)
      if (photo) URL.revokeObjectURL(photo.previewUrl)
      setPhoto(ready)
      setTimeout(() => altField.current?.focus(), 0)
    } catch (error) {
      setPhotoProblem(photoProblems[error.message] ?? photoProblems.unreadable)
    }
    setPreparing(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    setTried(true)
    if (empty || tooLong) return
    if (missingAlt) {
      altField.current?.focus()
      return
    }
    setSaving(true)
    setFailed(null)
    let post
    try {
      post = await addPost({ user, text, photo: photo && { ...photo, alt } })
    } catch (error) {
      setFailed(
        error.message === 'This browser is out of room for photos'
          ? 'This browser is out of room for more photos. Post without one, or delete an older photo post.'
          : "Couldn't post. Check your connection and try again.",
      )
      setSaving(false)
      return
    }
    setSaving(false)
    setText('')
    clearPhoto()
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
          {user?.name[0].toUpperCase()}
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

          {photo && (
            <div className="compose-photo">
              <div className="compose-photo-frame">
                <img src={photo.previewUrl} alt="" width={photo.width} height={photo.height} />
                <button type="button" className="howl-icon-button compose-photo-remove" aria-label="Remove photo" onClick={clearPhoto}>
                  <Icon name="close" />
                </button>
              </div>
              <label className="field">
                <span className="field-label">Describe the photo</span>
                <input
                  ref={altField}
                  className="howl-input"
                  placeholder="The Belltower lit up red after the game"
                  value={alt}
                  maxLength={300}
                  aria-invalid={tried && missingAlt ? 'true' : undefined}
                  aria-describedby="alt-help"
                  onChange={(event) => setAlt(event.target.value)}
                />
                <span id="alt-help" className={tried && missingAlt ? 'field-error' : 'howl-meta'}>
                  {tried && missingAlt
                    ? 'Add a short description so everyone knows what’s in the photo.'
                    : 'For people who use screen readers or can’t load the photo.'}
                </span>
              </label>
            </div>
          )}

          {photoProblem && (
            <div className="howl-notice is-error compose-message" role="alert">
              <Icon name="error" />
              <span>{photoProblem}</span>
            </div>
          )}
          {message && (
            <div className="howl-notice is-error compose-message" role="alert">
              <Icon name="error" />
              <span>{message}</span>
            </div>
          )}
          <div className="howl-composer-bar">
            <span className="compose-tools">
              <input ref={picker} type="file" accept="image/*" hidden onChange={choosePhoto} />
              <button
                type="button"
                className="howl-icon-button"
                aria-label={photo ? 'Change photo' : 'Add a photo'}
                disabled={preparing}
                onClick={() => picker.current?.click()}
              >
                <Icon name="image" />
              </button>
              <span className={`howl-meta${tooLong ? ' compose-over' : ''}`} aria-live="polite">
                {preparing ? 'Getting your photo ready…' : left < 0 ? `${-left} over` : left <= COUNTER_FROM ? `${left} left` : ''}
              </span>
            </span>
            <span className="compose-actions">
              <button type="button" className="howl-button is-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="howl-button" disabled={saving || preparing}>
                {saving ? (photo ? 'Uploading…' : 'Posting…') : 'Post'}
              </button>
            </span>
          </div>
        </div>
      </form>
    </dialog>
  )
}

export default Composer
