function Swatch({
  name,
  className,
  hex,
}: {
  name: string
  className: string
  hex: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 w-full rounded-lg border border-border ${className}`}
      />
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{hex}</p>
    </div>
  )
}

export function ColorPalette() {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Color Palette
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The core palette built around an energetic orange primary with neutral
        grays and semantic status colors.
      </p>

      {/* Primary */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Primary
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <Swatch name="Primary Light" className="bg-primary-light" hex="#FF8F5C" />
        <Swatch name="Primary" className="bg-primary" hex="#FF6B35" />
        <Swatch name="Primary Dark" className="bg-primary-dark" hex="#E55A2B" />
      </div>

      {/* Neutrals */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Neutrals
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Swatch name="Background" className="bg-background" hex="#FFFFFF" />
        <Swatch name="Background Alt" className="bg-background-alt" hex="#FAFAFA" />
        <Swatch name="Muted" className="bg-muted" hex="#F3F4F6" />
        <Swatch name="Foreground" className="bg-foreground" hex="#1A1A1A" />
      </div>

      {/* Status */}
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Status
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <Swatch name="Success" className="bg-success" hex="#10B981" />
        <Swatch name="Warning" className="bg-warning" hex="#F59E0B" />
        <Swatch name="Destructive" className="bg-destructive" hex="#EF4444" />
      </div>
    </section>
  )
}
