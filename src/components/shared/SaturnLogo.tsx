export function SaturnLogo({
  width = 40,
  height = 40,
}: {
  width?: number;
  height?: number;
}) {
  const size = Math.min(width, height);

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(165,180,252,0.16)" strokeWidth="1" />
      <path
        d="M20 4L22.5 15L33 12L25.5 20L33 28L22.5 25L20 36L17.5 25L7 28L14.5 20L7 12L17.5 15Z"
        fill="url(#saturnGrad)"
      />
      <circle cx="20" cy="20" r="3.5" fill="rgba(165,180,252,0.72)" />
      <defs>
        <radialGradient id="saturnGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" stopOpacity="0.85" />
        </radialGradient>
      </defs>
    </svg>
  );
}
