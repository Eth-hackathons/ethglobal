export function TypographyScale() {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Typography
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Inter for UI text at every weight, Bebas Neue for display headings and
        hero sections.
      </p>

      {/* Bebas Neue (serif token) */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Bebas Neue &mdash; Display / Hero
      </h3>
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
        <p className="font-serif text-5xl tracking-wide text-foreground md:text-7xl">
          Game Day Predictions
        </p>
        <p className="font-serif text-4xl tracking-wide text-foreground">
          Live Match Analysis
        </p>
        <p className="font-serif text-3xl tracking-wide text-foreground">
          Weekly Leaderboard
        </p>
        <p className="font-serif text-2xl tracking-wide text-foreground">
          Player Statistics
        </p>
      </div>

      {/* Inter (sans token) */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Inter &mdash; UI / Body
      </h3>
      <div className="mt-4 flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        {(
          [
            ["text-sm", "400", "Body Small (14px) — Regular"],
            ["text-base", "400", "Body Base (16px) — Regular"],
            ["text-base", "500", "Body Base (16px) — Medium"],
            ["text-lg", "600", "Label Large (18px) — Semibold"],
            ["text-xl", "700", "Heading XL (20px) — Bold"],
            ["text-2xl", "800", "Heading 2XL (24px) — Extrabold"],
          ] as const
        ).map(([size, weight, label]) => (
          <div key={label} className="flex items-baseline gap-4">
            <span
              className={`font-sans ${size} text-foreground`}
              style={{ fontWeight: Number(weight) }}
            >
              {label}
            </span>
            <span className="text-xs text-muted-foreground">
              {size} / {weight}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
