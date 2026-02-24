import { CheckCircle2, AlertTriangle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"

export function StatusBadges() {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Status & Badges
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Pill-shaped badges using rounded-full for status indicators, outcomes,
        and live-state labels.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {/* Status Badges */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Won
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              Lost
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Pending
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Clock className="h-3.5 w-3.5" />
              Live
            </span>
          </div>
        </div>

        {/* Trend Indicators */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trends
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              +12.5%
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              <TrendingDown className="h-3.5 w-3.5" />
              -3.2%
            </span>
          </div>
        </div>

        {/* Sport Tags */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sport Tags
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {["NFL", "NBA", "MLB", "NHL", "MLS", "UFC"].map((sport) => (
              <span
                key={sport}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary hover:text-primary"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
