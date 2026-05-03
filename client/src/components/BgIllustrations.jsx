export default function BgIllustrations() {
  const items = [
    // Lock - top left
    {
      x: "4%",
      y: "8%",
      size: 64,
      rotate: "-15deg",
      opacity: 0.06,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    // Coin stack - top right
    {
      x: "88%",
      y: "5%",
      size: 80,
      rotate: "12deg",
      opacity: 0.07,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="8" r="6" />
          <path d="M6 12c0 3.31 2.69 6 6 6s6-2.69 6-6" />
          <path d="M6 16c0 3.31 2.69 6 6 6s6-2.69 6-6" />
        </svg>
      ),
    },
    // Money note - mid left
    {
      x: "2%",
      y: "42%",
      size: 90,
      rotate: "8deg",
      opacity: 0.055,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="1" y="6" width="22" height="13" rx="2" />
          <circle cx="12" cy="12.5" r="2.5" />
          <path d="M5 12.5h1M18 12.5h1" />
        </svg>
      ),
    },
    // Trending chart - bottom left
    {
      x: "5%",
      y: "78%",
      size: 72,
      rotate: "-8deg",
      opacity: 0.065,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
    // Piggy bank - bottom right
    {
      x: "85%",
      y: "75%",
      size: 86,
      rotate: "10deg",
      opacity: 0.065,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M19 9a7 7 0 1 0-13.6 2.3A2 2 0 0 0 4 13v1a2 2 0 0 0 2 2h.5l1 3h5l1-3H14a2 2 0 0 0 2-2v-1a2 2 0 0 0-.4-1.2" />
          <path d="M19 9h2v4h-2" />
          <circle cx="9" cy="10" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
    // Wallet - top center-right
    {
      x: "68%",
      y: "3%",
      size: 58,
      rotate: "-10deg",
      opacity: 0.055,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 12V8H6a2 2 0 0 1 0-4h14v4" />
          <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
          <circle cx="17" cy="14" r="1" fill="currentColor" />
        </svg>
      ),
    },
    // Bar chart - mid right
    {
      x: "90%",
      y: "42%",
      size: 68,
      rotate: "6deg",
      opacity: 0.06,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
    },
    // Dollar sign - center top
    {
      x: "45%",
      y: "2%",
      size: 52,
      rotate: "5deg",
      opacity: 0.05,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    // Shield / savings protection - bottom center
    {
      x: "44%",
      y: "85%",
      size: 60,
      rotate: "-6deg",
      opacity: 0.055,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    // Target/goal - mid center-left
    {
      x: "22%",
      y: "60%",
      size: 54,
      rotate: "14deg",
      opacity: 0.05,
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    // Sparkle / star (accent) - scattered
    {
      x: "76%",
      y: "28%",
      size: 36,
      rotate: "20deg",
      opacity: 0.08,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      ),
    },
    {
      x: "14%",
      y: "22%",
      size: 28,
      rotate: "-18deg",
      opacity: 0.07,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            width: item.size,
            height: item.size,
            color: "var(--accent)",
            opacity: item.opacity,
            transform: `rotate(${item.rotate})`,
          }}
        >
          {item.svg}
        </div>
      ))}
    </div>
  );
}
