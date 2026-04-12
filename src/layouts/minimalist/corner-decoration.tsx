type CornerDecorationProps = {
  position: "top-left" | "bottom-right"
}

const PEAKS = [
  { cx: 80, cy: 80 },
  { cx: 140, cy: 40 },
  { cx: 210, cy: 100 },
]

export function CornerDecoration({ position }: CornerDecorationProps) {
  const isTopLeft = position === "top-left"
  const posClass = isTopLeft
    ? "fixed top-0 left-0 pointer-events-none z-0"
    : "fixed bottom-0 right-0 pointer-events-none z-0"
  const flip = isTopLeft ? "" : "scale-x-[-1] scale-y-[-1]"

  return (
    <div
      className={`${posClass} w-16 h-16 md:w-20 md:h-20 opacity-20 blur-[1px] ${flip}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Static speciation curves */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          <path d="M 0 240 C 30 240 50 80 80 80 C 110 80 130 240 160 240" />
          <path d="M 60 240 C 90 240 110 40 140 40 C 170 40 190 240 220 240" />
          <path d="M 130 240 C 160 240 180 100 210 100 C 240 100 260 240 290 240" />
        </g>

        {/* Static pH axis */}
        <line x1="0" y1="245" x2="310" y2="245" stroke="currentColor" strokeWidth="1" />

        {/* Static pKa ticks */}
        {[80, 140, 210].map((x) => (
          <line key={x} x1={x} y1="240" x2={x} y2="255" stroke="currentColor" strokeWidth="1" />
        ))}

        {/* Pulsing dots at curve peaks — infinite */}
        {PEAKS.map(({ cx, cy }, i) => (
          <circle key={cx} cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.85">
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2.6s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
            />
            <animate
              attributeName="opacity"
              values="0.85;0.3;0.85"
              dur="2.6s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
