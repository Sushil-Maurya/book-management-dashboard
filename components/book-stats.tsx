"use client"

import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@/lib/types"

interface BookStatsProps {
  books: Book[]
  loading: boolean
}

export function BookStats({ books, loading }: BookStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalBooks = books.length
  const availableBooks = books.filter((book) => book.status === "Available").length
  const issuedBooks = books.filter((book) => book.status === "Issued").length
  const uniqueGenres = new Set(books.map((book) => book.genre)).size

  const stats = [
    {
      title: "Total Books",
      value: totalBooks,
      description: "Books in collection",
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Available",
      value: availableBooks,
      description: "Ready to issue",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Issued",
      value: issuedBooks,
      description: "Currently borrowed",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Genres",
      value: uniqueGenres,
      description: "Different categories",
      icon: TrendingUp,
      color: "text-accent",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
