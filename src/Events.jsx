import Icon from './Icon.jsx'
import { Link } from './router.jsx'
import { eventDay, eventMonth, eventWhen, isOver } from './eventTime.js'

export function EventCard({ event, onGoing, index = 0 }) {
  const over = isOver(event.startsAt)
  return (
    <article className={`howl-event howl-rise${over ? ' is-past' : ''}`} style={{ '--i': index }}>
      <div className="howl-event-date" aria-hidden="true">
        <span className="month">{eventMonth(event.startsAt)}</span>
        <span className="day">{eventDay(event.startsAt)}</span>
      </div>
      <div>
        <h3 className="howl-event-title">{event.title}</h3>
        <p className="howl-meta">
          {eventWhen(event.startsAt)} · {event.place}
        </p>
        {event.details && <p>{event.details}</p>}
        <div className="howl-post-actions">
          {over ? (
            <span className="howl-meta">{event.goingCount} went</span>
          ) : (
            <>
              <button
                className={`howl-button is-secondary going-button${event.going ? ' is-going' : ''}`}
                aria-pressed={event.going}
                onClick={() => onGoing(event.id)}
              >
                {event.going && <Icon name="ok" />}
                {event.going ? 'Going' : "I'm going"}
              </button>
              <span className="howl-meta">
                <span key={event.goingCount} className="howl-count is-changing">
                  {event.goingCount}
                </span>{' '}
                going
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

// The Events page: what's coming up on campus, soonest first, then what already happened.
export function EventsPage({ events, failed, onRetry, onGoing }) {
  if (failed) {
    return (
      <>
        <h2 className="page-title">Events</h2>
        <div className="howl-empty" role="alert">
          <p>Couldn't load events. Check your connection and try again.</p>
          <button className="howl-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      </>
    )
  }
  const upcoming = (events ?? []).filter((event) => !isOver(event.startsAt))
  const past = (events ?? []).filter((event) => isOver(event.startsAt)).reverse()
  return (
    <>
      <h2 className="page-title">Events</h2>
      <p className="howl-meta page-lead">What's happening on campus. Tap I'm going so friends know you'll be there.</p>
      {events === null ? (
        <p className="howl-meta feed-status" role="status">
          Loading events…
        </p>
      ) : upcoming.length === 0 ? (
        <div className="howl-empty">
          <p>Nothing on the calendar yet. Check back soon.</p>
        </div>
      ) : (
        <ol className="event-list">
          {upcoming.map((event, index) => (
            <li key={event.id}>
              <EventCard event={event} onGoing={onGoing} index={index} />
            </li>
          ))}
        </ol>
      )}
      {past.length > 0 && (
        <>
          <h3 className="section-title">Earlier</h3>
          <ol className="event-list">
            {past.map((event, index) => (
              <li key={event.id}>
                <EventCard event={event} onGoing={onGoing} index={upcoming.length + index} />
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}

// The side column on laptops: the next three events.
export function ComingUp({ events }) {
  const next = (events ?? []).filter((event) => !isOver(event.startsAt)).slice(0, 3)
  return (
    <section aria-labelledby="coming-up">
      <h2 id="coming-up" className="side-title">
        Coming up
      </h2>
      {events === null ? (
        <p className="howl-meta">Loading events…</p>
      ) : next.length === 0 ? (
        <p className="howl-meta">No events this week.</p>
      ) : (
        <ol className="coming-up">
          {next.map((event, index) => (
            <li key={event.id} className="howl-rise" style={{ '--i': index + 2 }}>
              <Link to="/events" className="coming-up-link">
                <span className="coming-up-when howl-meta">
                  <Icon name="calendar" />
                  {eventWhen(event.startsAt)}
                </span>
                <strong>{event.title}</strong>
                <span className="howl-meta">
                  {event.place} · {event.goingCount} going
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <Link to="/events" className="howl-more side-more">
        See all events
      </Link>
    </section>
  )
}
