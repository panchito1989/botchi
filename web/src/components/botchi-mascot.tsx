export type BotchiMode = "idle" | "speaking" | "thinking";

/**
 * Mascota Botchi (SVG pixel-art) con animaciones sutiles "vivas":
 * - parpadeo cada ~5–6s
 * - respiración (scale 1.02)
 * - antenas con micro-vaivén ocasional
 * - modo "speaking": la boca se mueve como si hablara
 * - modo "thinking": ojos parpadean más rápido + boca atenuada
 * Todas las animaciones se desactivan automáticamente cuando el sistema
 * pide `prefers-reduced-motion: reduce` (accesibilidad).
 */
export function BotchiMascot({
  className = "",
  size = 120,
  mode = "idle",
}: {
  className?: string;
  size?: number;
  mode?: BotchiMode;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`botchi-mascot botchi-${mode} ${className}`}
      role="img"
      aria-label="Botchi"
      shapeRendering="crispEdges"
    >
      <style>{`
        .botchi-mascot { overflow: visible; }
        .botchi-mascot .bm-ant   { transform-box: fill-box; transform-origin: 50% 100%; }
        .botchi-mascot .bm-ant-l { animation: bm-ant 7.5s ease-in-out infinite; }
        .botchi-mascot .bm-ant-r { animation: bm-ant 7.5s ease-in-out infinite 1.4s; }
        .botchi-mascot .bm-head  { transform-box: fill-box; transform-origin: center; animation: bm-breathe 4.2s ease-in-out infinite; }
        .botchi-mascot .bm-eyes  { transform-box: fill-box; transform-origin: center; animation: bm-blink 5.6s ease-in-out infinite; }
        .botchi-mascot .bm-mouth { transform-box: fill-box; transform-origin: center; }

        @keyframes bm-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 97%      { transform: scaleY(0.12); }
        }
        @keyframes bm-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
        @keyframes bm-ant {
          0%, 85%, 100% { transform: rotate(0deg); }
          90%           { transform: rotate(-10deg); }
          95%           { transform: rotate(6deg); }
        }
        @keyframes bm-talk {
          0%, 100% { transform: scaleY(1); }
          25%      { transform: scaleY(2.1); }
          50%      { transform: scaleY(0.7); }
          75%      { transform: scaleY(1.7); }
        }

        .botchi-speaking .bm-mouth { animation: bm-talk 0.42s ease-in-out infinite; }
        .botchi-thinking .bm-mouth { opacity: 0.35; }
        .botchi-thinking .bm-eyes  { animation-duration: 2.4s; }

        @media (prefers-reduced-motion: reduce) {
          .botchi-mascot * { animation: none !important; }
        }
      `}</style>

      {/* antenas */}
      <g className="bm-ant bm-ant-l">
        <rect x="30" y="10" width="4" height="10" fill="#5eead4" />
        <rect x="28" y="6"  width="8" height="6"  fill="#5eead4" />
      </g>
      <g className="bm-ant bm-ant-r">
        <rect x="66" y="10" width="4" height="10" fill="#5eead4" />
        <rect x="64" y="6"  width="8" height="6"  fill="#5eead4" />
      </g>

      {/* cabeza + cara (respira como grupo) */}
      <g className="bm-head">
        <rect x="20" y="20" width="60" height="54" rx="14" fill="#2dd4bf" />
        <rect x="24" y="24" width="52" height="46" rx="11" fill="#5eead4" />

        {/* ojos (parpadean juntos) */}
        <g className="bm-eyes">
          <rect x="34" y="38" width="9" height="12" rx="2" fill="#0f2e2a" />
          <rect x="57" y="38" width="9" height="12" rx="2" fill="#0f2e2a" />
          <rect x="36" y="40" width="3" height="4" fill="#ffffff" />
          <rect x="59" y="40" width="3" height="4" fill="#ffffff" />
        </g>

        {/* cachetes */}
        <rect x="28" y="52" width="8" height="5" rx="2" fill="#fb7185" opacity="0.7" />
        <rect x="64" y="52" width="8" height="5" rx="2" fill="#fb7185" opacity="0.7" />

        {/* boca (se mueve en modo speaking) */}
        <g className="bm-mouth">
          <rect x="42" y="56" width="16" height="4" rx="2" fill="#0f2e2a" />
          <rect x="40" y="53" width="4" height="4" fill="#0f2e2a" />
          <rect x="56" y="53" width="4" height="4" fill="#0f2e2a" />
        </g>
      </g>
    </svg>
  );
}
