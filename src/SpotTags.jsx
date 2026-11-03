import Icon from './Icon.jsx'

function SpotTags({ spots, selected, onSelect, className }) {
  const tag = (label, value) => {
    const on = selected === value
    return (
      <button
        key={label}
        className="howl-tag"
        aria-pressed={on}
        onClick={() => onSelect(on ? null : value)}
      >
        {on && <Icon name="ok" />}
        {label}
      </button>
    )
  }

  return (
    <div className={className} role="group" aria-label="Filter by campus spot">
      {tag('All posts', null)}
      {spots.filter(Boolean).map((spot) => tag(spot, spot))}
    </div>
  )
}

export default SpotTags
