import { ColorPalette } from "@/components/showcase/color-palette"
import { TypographyScale } from "@/components/showcase/typography-scale"
import { ButtonStyles } from "@/components/showcase/button-styles"
import { CardExamples } from "@/components/showcase/card-examples"
import { StatusBadges } from "@/components/showcase/status-badges"
import { SpacingGrid } from "@/components/showcase/spacing-grid"

export function DesignSystemShowcase() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="bg-foreground px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Design System
          </p>
          <h1 className="font-serif text-5xl tracking-wide text-background md:text-7xl">
            Sports Predictions
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            A complete Tailwind CSS design system configuration for a
            sports prediction platform. Orange primary, Inter + Bebas Neue
            typography, and a full set of semantic tokens.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="flex flex-col gap-16">
          <ColorPalette />
          <TypographyScale />
          <ButtonStyles />
          <StatusBadges />
          <CardExamples />
          <SpacingGrid />
        </div>
      </div>
    </main>
  )
}
