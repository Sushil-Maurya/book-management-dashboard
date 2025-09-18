"use client"

import { useState, useEffect } from "react"
import type { Book, BookFilters, PaginationInfo } from "@/lib/types"
import { booksApi } from "@/lib/api"

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })
  const [filters, setFilters] = useState<BookFilters>({
    search: "",
    genre: "all",
    status: "all",
  })

  const fetchBooks = async (page = 1, currentFilters: BookFilters = filters) => {
    try {
      setLoading(true)
      setError(null)

      const { books: fetchedBooks, total } = await booksApi.getBooks(page, pagination.itemsPerPage, {
        search: currentFilters.search,
        genre: currentFilters.genre === "all" ? undefined : currentFilters.genre,
        status: currentFilters.status === "all" ? undefined : currentFilters.status,
      })

      setBooks(fetchedBooks)
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / prev.itemsPerPage),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch books")
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<BookFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchBooks(1, updatedFilters) // Reset to page 1 when filters change
  }

  const goToPage = (page: number) => {
    fetchBooks(page)
  }

  const refreshBooks = () => {
    fetchBooks(pagination.currentPage)
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return {
    books,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refreshBooks,
  }
}
