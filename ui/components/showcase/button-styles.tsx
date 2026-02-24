import { Zap, ArrowRight, Trophy } from "lucide-react"

export function ButtonStyles() {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Buttons
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Three button variants — primary (solid orange), secondary (outlined),
        and ghost (transparent). All use duration-200 transitions.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {/* Primary Buttons */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Primary
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              <Zap className="h-4 w-4" />
              Place Prediction
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Secondary
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent">
              View Matches
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent">
              My Predictions
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent">
              Stats
            </button>
          </div>
        </div>

        {/* Ghost Buttons */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ghost
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary">
              Learn More
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary">
              Cancel
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-primary">
              Settings
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              Small
            </button>
            <button className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              Default
            </button>
            <button className="inline-flex items-center rounded-lg bg-primary px-7 py-3 text-base font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
              Large
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
