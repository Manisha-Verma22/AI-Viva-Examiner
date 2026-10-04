/* ELYSIAN cap mark (graduation cap + voice waves) - shared logo icon */
export default function ElysianMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.9)}
      viewBox="14 24 132 118"
      role="img"
      aria-label="ELYSIAN logo"
    >
      <defs>
        <linearGradient
          id="elysian-cap-gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#A8D0F0" />
          <stop offset="1" stopColor="#609FD5" />
        </linearGradient>
      </defs>

      <path
        d="M30 56 v22 c0 10 22 18 50 18 s50 -8 50 -18 v-22 l-50 18 z"
        fill="#609FD5"
      />

      <polygon
        points="80,32 140,56 80,80 20,56"
        fill="url(#elysian-cap-gradient)"
        stroke="#000000"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      <line
        x1="130"
        y1="60"
        x2="130"
        y2="92"
        stroke="#000000"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="130" cy="98" r="6" fill="#000000" />

      <g fill="none" strokeLinecap="round" strokeWidth="5.5">
        <path d="M62 116 q18 12 36 0" stroke="#000000" />
        <path d="M48 126 q32 22 64 0" stroke="#609FD5" />
      </g>
    </svg>
  );
}