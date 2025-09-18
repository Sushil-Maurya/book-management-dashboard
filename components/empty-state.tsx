"use client"

import { BookOpen, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  type: "no-books" | "no-results" | "error"
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "no-books":
        return <BookOpen className="h-12 w-12 text-muted-foreground/50" />
      case "no-results":
        return <Search className="h-12 w-12 text-muted-foreground/50" />
      case "error":
        return <BookOpen className="h-12 w-12 text-destructive/50" />
      default:
        return <BookOpen className="h-12 w-12 text-muted-foreground/50" />
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">{getIcon()}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-balance">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
