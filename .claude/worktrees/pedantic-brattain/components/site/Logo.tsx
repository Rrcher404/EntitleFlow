import React from "react";

type LogoVariant = "full" | "icon";
type LogoTheme = "light" | "dark";

interface LogoProps {
  /** "full" = icon + wordmark lockup (default); "icon" = mark only */
  variant?: LogoVariant;
  /** "light" = dark mark on light bg; "dark" = light mark on dark bg */
  theme?: LogoTheme;
  /** Height in px — width scales proportionally */
  height?: number;
  className?: string;
}

// ─── Color tokens (matches design system CSS variables) ──────────────────────
const tokens = {
  light: {
    bg: "#0f3c35",       // --primary  (icon container fill)
    line1: "#dff2ef",    // --accent   (top line)
    lineCurve: "#25a18e", // --ring    (curved flow line)
    line3: "#dff2ef",    // --accent   (bottom stub, dimmed)
    dot: "#25a18e",      // --ring     (flow endpoint dot)
    wordEntitle: "#102034", // --foreground
    wordFlow: "#25a18e",    // --ring
  },
  dark: {
    bg: "#25a18e",       // --ring
    line1: "#ffffff",
    lineCurve: "#dff2ef",
    line3: "#ffffff",
    dot: "#ffffff",
    wordEntitle: "#f8fafc",
    wordFlow: "#6ee7d8",
  },
} as const;

// ─── Icon mark (48×48 viewBox) ────────────────────────────────────────────────
type ThemeTokens = (typeof tokens)[keyof typeof tokens];

function IconMark({ t }: { t: ThemeTokens }) {
  return (
    <>
      {/* Rounded-rect container */}
      <rect x="1" y="1" width="46" height="46" rx="12" fill={t.bg} />

      {/* Line 1: full-width straight */}
      <line
        x1="10" y1="15" x2="38" y2="15"
        stroke={t.line1} strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Line 2: routes down-right — the "flow" */}
      <path
        d="M10 24 L26 24 Q32 24 34 28 L38 33"
        stroke={t.lineCurve} strokeWidth="2.5" strokeLinecap="round" fill="none"
      />

      {/* Line 3: short stub, lower-left — implies a second unresolved thread */}
      <line
        x1="10" y1="33" x2="24" y2="33"
        stroke={t.line3} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"
      />

      {/* Endpoint dot — the "resolved" moment */}
      <circle cx="38" cy="33" r="3" fill={t.dot} />
    </>
  );
}

// ─── Full wordmark lockup ─────────────────────────────────────────────────────
export function Logo({
  variant = "full",
  theme = "light",
  height = 36,
  className,
}: LogoProps) {
  const t = tokens[theme];
  const iconSize = height;
  const fontSize = Math.round(height * 0.58);

  if (variant === "icon") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="EntitleFlow"
        role="img"
        className={className}
      >
        <IconMark t={t} />
      </svg>
    );
  }

  // Full lockup: icon + wordmark side-by-side
  const gap = Math.round(height * 0.35);
  const wordmarkWidth = Math.round(fontSize * 5.6); // approximate text width
  const totalWidth = iconSize + gap + wordmarkWidth;
  const wordX = iconSize + gap;
  const baselineY = Math.round(iconSize * 0.58);

  return (
    <svg
      width={totalWidth}
      height={iconSize}
      viewBox={`0 0 ${totalWidth} ${iconSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EntitleFlow"
      role="img"
      className={className}
    >
      {/* Icon mark */}
      <g>
        <svg width={iconSize} height={iconSize} viewBox="0 0 48 48">
          <IconMark t={t} />
        </svg>
      </g>

      {/* Wordmark */}
      <text
        x={wordX}
        y={baselineY}
        fontFamily="'Manrope', sans-serif"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="-0.02em"
        fill={t.wordEntitle}
      >
        Entitle
      </text>
      <text
        x={wordX}
        y={iconSize - Math.round(iconSize * 0.1)}
        fontFamily="'Manrope', sans-serif"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="-0.02em"
        fill={t.wordFlow}
      >
        Flow
      </text>
    </svg>
  );
}

export default Logo;
