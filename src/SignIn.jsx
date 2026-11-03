import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { sendSignInLink } from './postStore.js'

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

// Asks for a name and email, then sends a sign-in link. `reason` says why it opened, like "Sign in to howl."
function SignIn({ open, reason, onClose, onSignedIn }) {
  const dialog = useRef(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) {
      setSentTo(null)
      setFailed(false)
      el.showModal()
    }
    if (!open && el.open) el.close()
  }, [open])

  const nameError = name.trim().length < 2 ? 'Add a name of at least 2 letters.' : null
  const emailError = looksLikeEmail(email) ? null : 'Add an email like you@ncsu.edu.'

  const submit = async (event) => {
    event.preventDefault()
    setTried(true)
    if (nameError || emailError) return
    setSending(true)
    setFailed(false)
    try {
      const result = await sendSignInLink({ email: email.trim(), name: name.trim() })
      if (result.emailed) setSentTo(email.trim())
      else onSignedIn(result.user)
    } catch {
      setFailed(true)
    }
    setSending(false)
  }

  return (
    <dialog
      ref={dialog}
      className="compose sheet howl-surface"
      aria-labelledby="sign-in-title"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
    >
      {sentTo ? (
        <div className="sheet-body">
          <h2 id="sign-in-title" className="sheet-title">
            Check your email
          </h2>
          <p>
            We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device and you'll come right back here,
            signed in.
          </p>
          <div className="sheet-actions">
            <button type="button" className="howl-button" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      ) : (
        <form className="sheet-body" onSubmit={submit} noValidate>
          <h2 id="sign-in-title" className="sheet-title">
            {reason ?? 'Sign in to Howl'}
          </h2>
          <p className="howl-meta">Reading is open to everyone. Sign in to post, howl and report. No password needed.</p>

          <label className="field">
            <span className="field-label">Name on your posts</span>
            <input
              className="howl-input"
              autoComplete="nickname"
              placeholder="wolfpack_will"
              value={name}
              aria-invalid={tried && nameError ? 'true' : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            {tried && nameError && <span className="field-error">{nameError}</span>}
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="howl-input"
              type="email"
              autoComplete="email"
              placeholder="you@ncsu.edu"
              value={email}
              aria-invalid={tried && emailError ? 'true' : undefined}
              onChange={(event) => setEmail(event.target.value)}
            />
            {tried && emailError && <span className="field-error">{emailError}</span>}
          </label>

          {failed && (
            <div className="howl-notice is-error" role="alert">
              <Icon name="error" />
              <span>Couldn't send the link. Check your email address and try again.</span>
            </div>
          )}

          <div className="sheet-actions">
            <button type="button" className="howl-button is-secondary" onClick={onClose}>
              Not now
            </button>
            <button type="submit" className="howl-button" disabled={sending}>
              {sending ? 'Sending…' : 'Email me a link'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}

export default SignIn
