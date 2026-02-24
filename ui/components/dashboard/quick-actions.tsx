"use client"

import { Plus, ArrowDownToLine, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function QuickActions() {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5">
        <span className="text-sm font-medium text-muted-foreground mr-auto">
          Quick Actions
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" />
            Create Market
          </Button>
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowDownToLine className="size-4" />
            Import from Polymarket
          </Button>
          <Button variant="ghost">
            <Settings className="size-4" />
            Manage Communities
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
