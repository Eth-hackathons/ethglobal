import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center" role="alert">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-destructive/10 mb-5">
        <AlertTriangle className="size-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        Failed to load markets
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Something went wrong while loading the markets. Please try again.
      </p>

      <Button
        onClick={onRetry}
        className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md hover:shadow-lg transition-shadow font-semibold gap-2"
      >
        <RefreshCw className="size-4" />
        Retry
      </Button>
    </div>
  )
}
