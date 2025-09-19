import { useState, useEffect, useCallback } from "react"
import type { Book, BookFormData, BookFilters, PaginationInfo } from "@/lib/types"
import { booksApi } from "@/lib/api"

export function useBooks() {
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<BookFilters>({
    search: "",
    genre: "all",
    status: "all",
  })

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // API calls
  const refreshBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { books: fetchedBooks, total } = await booksApi.getBooks(
        pagination.currentPage,
        pagination.itemsPerPage,
        {
          search: filters.search,
          genre: filters.genre !== 'all' ? filters.genre : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
        }
      )
      
      setAllBooks(fetchedBooks)
      setPagination(prev => ({
        ...prev,
        totalItems: total,
        totalPages: Math.ceil(total / prev.itemsPerPage)
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch books")
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters.search, filters.genre, filters.status])

  // Books are already filtered and paginated by the API
  const books = allBooks

  const updateFilters = (newFilters: Partial<BookFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const getBook = (id: string) => allBooks.find((b) => b.id === id)
  const createBook = async (data: BookFormData) => {
    const newBook = await booksApi.createBook(data)
    await refreshBooks()
    return newBook
  }
  const updateBook = async (id: string, data: Partial<BookFormData>) => {
    const updated = await booksApi.updateBook(id, data)
    await refreshBooks()
    return updated
  }
  const deleteBook = async (id: string) => {
    await booksApi.deleteBook(id)
    await refreshBooks()
  }
  const getGenres = () => [...new Set(allBooks.map((b) => b.genre))]

  // Initial load and when filters/pagination changes
  useEffect(() => {
    refreshBooks()
  }, [refreshBooks])

  return {
    books,        // derived
    allBooks,     // raw
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refreshBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    getGenres,
  }
}