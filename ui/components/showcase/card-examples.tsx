import { Trophy, TrendingUp, Users, Star } from "lucide-react"

export function CardExamples() {
  return (
    <section>
      <h2 className="font-serif text-3xl tracking-wide text-foreground">
        Cards
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Cards use rounded-lg, shadow-sm by default, and shadow-md on hover with
        duration-200 transitions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Match Card */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Live
            </span>
            <span className="text-xs text-muted-foreground">NFL Week 12</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-center">
              <p className="font-serif text-2xl text-card-foreground">KC</p>
              <p className="text-xs text-muted-foreground">Chiefs</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-muted-foreground">VS</p>
              <p className="mt-1 font-serif text-xl text-primary">24 - 17</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl text-card-foreground">BUF</p>
              <p className="text-xs text-muted-foreground">Bills</p>
            </div>
          </div>
          <button className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md">
            Predict Winner
          </button>
        </div>

        {/* Stats Card */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="text-sm font-semibold text-card-foreground">
            Your Stats
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              {
                icon: Trophy,
                label: "Win Rate",
                value: "68%",
                color: "text-primary",
              },
              {
                icon: TrendingUp,
                label: "Streak",
                value: "5W",
                color: "text-success",
              },
              {
                icon: Users,
                label: "Rank",
                value: "#42",
                color: "text-foreground",
              },
              {
                icon: Star,
                label: "Points",
                value: "1,240",
                color: "text-warning",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg bg-background-alt p-3"
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-card-foreground">
              Top Predictors
            </h3>
            <button className="text-xs font-medium text-primary transition-colors duration-200 hover:text-primary-dark">
              View All
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { rank: 1, name: "Alex Rivera", points: "2,450", streak: "12W" },
              { rank: 2, name: "Jordan Lee", points: "2,310", streak: "8W" },
              { rank: 3, name: "Sam Parker", points: "2,180", streak: "6W" },
            ].map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 rounded-lg bg-background-alt p-3"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    user.rank === 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {user.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.points} pts
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                  {user.streak}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
