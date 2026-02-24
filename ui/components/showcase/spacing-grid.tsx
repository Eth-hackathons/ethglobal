export function SpacingGrid() {
  const spacings = [
    { name: "1 (4px)", className: "w-1 h-4" },
    { name: "2 (8px)", className: "w-2 h-4" },
    { name: "3 (12px)", className: "w-3 h-4" },
    { name: "4 (16px)", className: "w-4 h-4" },
    { name: "5 (20px)", className: "w-5 h-4" },
    { name: "6 (24px)", className: "w-6 h-4" },
    { name: "8 (32px)", className: "w-8 h-4" },
    { name: "10 (40px)", className: "w-10 h-4" },
    { name: "12 (48px)", className: "w-12 h-4" },
    { name: "16 (64px)", className: "w-16 h-4" },
  ]

  const radii = [
    { name: "sm", className: "rounded-sm" },
    { name: "md", className: "rounded-md" },
    { name: "lg", className: "rounded-lg" },
    { name: "xl", className: "rounded-xl" },
    { name: "full", className: "rounded-full" },
  ]

  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Spacing & Radius
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Built on a 4px grid. Container max-width 1280px with px-4 (mobile) to
        px-8 (desktop).
      </p>

      {/* Spacing */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Spacing Scale (4px base)
      </h3>
      <div className="mt-4 flex flex-col gap-2">
        {spacings.map(({ name, className }) => (
          <div key={name} className="flex items-center gap-4">
            <span className="w-20 text-xs text-muted-foreground">{name}</span>
            <div className={`${className} rounded-sm bg-primary`} />
          </div>
        ))}
      </div>

      {/* Border Radius */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Border Radius
      </h3>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        {radii.map(({ name, className }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className={`h-16 w-16 border-2 border-primary bg-primary/10 ${className}`}
            />
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>

      {/* Shadows */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Shadows
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        {[
          { name: "shadow-sm", className: "shadow-sm" },
          { name: "shadow", className: "shadow" },
          { name: "shadow-md", className: "shadow-md" },
          { name: "shadow-lg", className: "shadow-lg" },
        ].map(({ name, className }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div
              className={`h-16 w-16 rounded-lg border border-border bg-card ${className}`}
            />
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
