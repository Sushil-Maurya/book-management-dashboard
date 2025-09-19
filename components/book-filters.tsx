"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
// import { booksApi } from "@/lib/api"
import type { BookFilters as BookFiltersType } from "@/lib/types"

interface BookFiltersProps {
  filters: BookFiltersType
  onFiltersChange: (filters: Partial<BookFiltersType>) => void
  loading: boolean
  getGenres: () => string[]
}

export function BookFilters({ filters, onFiltersChange, loading, getGenres }: BookFiltersProps) {

  const [searchInput, setSearchInput] = useState(filters.search)

  

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ search: searchInput })
  }

  const clearFilters = () => {
    setSearchInput("")
    onFiltersChange({ search: "", genre: "all", status: "all" })
  }

  const hasActiveFilters = filters.search || filters.genre !== "all" || filters.status !== "all"

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          Search
        </Button>
      </form>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters:</span>
        </div>

        <Select value={filters.genre} onValueChange={(value) => onFiltersChange({ genre: value })} disabled={loading}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {getGenres().map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ status: value })} disabled={loading}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Issued">Issued</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} disabled={loading}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary">
              Search: {filters.search}
              <button onClick={() => onFiltersChange({ search: "" })} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.genre !== "all" && (
            <Badge variant="secondary">
              Genre: {filters.genre}
              <button onClick={() => onFiltersChange({ genre: "all" })} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary">
              Status: {filters.status}
              <button onClick={() => onFiltersChange({ status: "all" })} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}