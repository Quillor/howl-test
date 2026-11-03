const paths = {
  howl: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  reply: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 20.5l1.5-5A8 8 0 1 1 21 12z"/>',
  share: '<path d="M7 17 17 7M8 7h9v9"/>',
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  write: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  bell: '<path d="M6 17V11a6 6 0 1 1 12 0v6l2 2H4zM10 21h4"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
  ok: '<path d="M5 12.5 10 17.5 19 7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
}

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: paths[name] }}
    />
  )
}

export default Icon
