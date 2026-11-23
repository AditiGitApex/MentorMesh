/** Quiet geometric mark — brand signal without glow or emoji. */
export function MeshMark({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.25" />
      <circle cx="10" cy="11" r="2" fill="currentColor" fillOpacity="0.9" />
      <circle cx="22" cy="10" r="2" fill="currentColor" fillOpacity="0.55" />
      <circle cx="16" cy="21" r="2.25" fill="currentColor" />
      <path
        d="M10 11L16 21L22 10"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}
