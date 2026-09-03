export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vender.IA"
    >
      <text
        x="20"
        y="72"
        fill="white"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="72"
        fontWeight="800"
        letterSpacing="-0.03em"
      >
        VENDER
      </text>
      <text
        x="348"
        y="72"
        fill="white"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="72"
        fontWeight="800"
        letterSpacing="-0.03em"
      >
        .IA
      </text>
      <path
        d="M350 88 Q400 105 460 82"
        stroke="url(#logo-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M455 80 L470 72"
        stroke="url(#logo-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M455 84 L470 94"
        stroke="url(#logo-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M472 14 L479 8 L486 18 L494 11 L490 24 L498 27 L488 32 L490 44 L480 36 L470 44 L472 32 L462 27 L472 24 L466 11 Z"
        fill="#3b82f6"
      />
      <text
        x="20"
        y="108"
        fill="#94a3b8"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="500"
        letterSpacing="0.25em"
      >
        INTELIGÊNCIA
      </text>
      <text
        x="182"
        y="108"
        fill="#3b82f6"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="600"
        letterSpacing="0.25em"
      >
        COMERCIAL
      </text>
      <text
        x="314"
        y="108"
        fill="#94a3b8"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="500"
        letterSpacing="0.25em"
      >
        AUTOMATIZADA
      </text>
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="350"
          y1="88"
          x2="470"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
