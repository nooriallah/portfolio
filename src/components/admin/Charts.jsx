/**
 * src/components/admin/Charts.jsx — SMALL SVG CHARTS FOR THE DASHBOARD.
 *
 * Pure SVG, no library. Two charts:
 *   <BarChart data />      one series of monthly counts (messages per month);
 *                          bars are navy, the highest month is amber, values
 *                          appear on hover (native <title> tooltip + label).
 *   <Donut value total />  share of a whole (published projects), amber arc on
 *                          a navy track with the percentage in the middle.
 *
 * Colours come from the admin tokens in globals.css (--adm-navy, --adm-amber).
 * Sizes: the `width/height` attributes below; both scale to their container.
 */

/** data: [{ label: "Jan", value: 3 }, …] */
export function BarChart({ data, height = 180 }) {
  const w = 560;
  const padX = 28;
  const padTop = 22;
  const padBottom = 26;
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxIndex = data.findIndex((d) => d.value === max && max > 0);
  const slot = (w - padX * 2) / data.length;
  const barW = Math.min(26, slot * 0.5);
  const plotH = height - padTop - padBottom;
  // 4 horizontal grid lines
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Messages received per month"
    >
      {/* grid */}
      {ticks.map((t, i) => {
        const y = padTop + plotH - (t / max) * plotH;
        return (
          <g key={i}>
            <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="var(--line)" strokeWidth="1" />
            <text x={padX - 8} y={y + 3} fontSize="9" textAnchor="end" fill="var(--faint)">
              {t}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {data.map((d, i) => {
        const h = (d.value / max) * plotH;
        const x = padX + i * slot + (slot - barW) / 2;
        const y = padTop + plotH - h;
        const hot = i === maxIndex;
        return (
          <g key={d.label} className="group">
            <title>{`${d.label}: ${d.value} message${d.value === 1 ? "" : "s"}`}</title>
            {/* invisible wide hit area so hover is easy */}
            <rect x={padX + i * slot} y={padTop} width={slot} height={plotH} fill="transparent" />
            <rect
              x={x}
              y={h > 0 ? y : padTop + plotH - 2}
              width={barW}
              height={h > 0 ? h : 2}
              rx="4"
              fill={hot ? "var(--adm-amber)" : "var(--adm-navy)"}
              className="transition-opacity group-hover:opacity-80"
            />
            {/* value label: always on the top month, on hover for the rest */}
            <text
              x={x + barW / 2}
              y={y - 6}
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              fill="var(--heading)"
              className={hot ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"}
            >
              {d.value}
            </text>
            <text
              x={x + barW / 2}
              y={height - 8}
              fontSize="10"
              textAnchor="middle"
              fill="var(--muted)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A ring showing value / total as a percentage. */
export function Donut({ value, total, size = 150, label }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={`${pct}% ${label ?? ""}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--adm-navy)" strokeWidth="16" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="var(--adm-amber)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--heading)">
        {pct}%
      </text>
    </svg>
  );
}
