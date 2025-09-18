"use client"

import { useState } from "react"
import { Box, Button, Card, CardContent, CardHeader, Typography, Skeleton } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { useBooks } from "@/hooks/use-books"
import { BookTable } from "./book-table"
import { BookFilters } from "./book-filters"
import { BookStats } from "./book-stats"
import { BookFormModal } from "./book-form-modal"
import { DeleteBookDialog } from "./delete-book-dialog"
import { BookDetailModal } from "./book-detail-modal"
import { EmptyState } from "./empty-state"
import { LoadingSpinner } from "./loading-spinner"
import type { Book } from "@/lib/types"

export function BookDashboard() {
  const { books, loading, error, pagination, filters, updateFilters, goToPage, refreshBooks } = useBooks()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [viewingBook, setViewingBook] = useState<Book | null>(null)

  const handleEditBook = (book: Book) => {
    setEditingBook(book)
  }

  const handleDeleteBook = (book: Book) => {
    setDeletingBook(book)
  }

  const handleViewBook = (book: Book) => {
    setViewingBook(book)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBook(null)
  }

  const handleCloseDeleteDialog = () => {
    setDeletingBook(null)
  }

  const handleCloseDetailModal = () => {
    setViewingBook(null)
  }

  const handleModalSuccess = () => {
    refreshBooks()
    handleCloseModal()
  }

  const handleDeleteSuccess = () => {
    refreshBooks()
    handleCloseDeleteDialog()
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", p: 3 }}>
        <EmptyState
          type="error"
          title="Failed to Load Books"
          description="There was an error loading your book collection. Please check your connection and try again."
          action={{
            label: "Retry",
            onClick: refreshBooks,
          }}
        />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Book Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your library collection efficiently
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
          sx={{ minWidth: { xs: "100%", sm: "auto" } }}
        >
          Add Book
        </Button>
      </Box>

      {/* Stats Cards */}
      <BookStats books={books} loading={loading} />

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardHeader>
          <Typography variant="h6">Search & Filter</Typography>
        </CardHeader>
        <CardContent>
          <BookFilters filters={filters} onFiltersChange={updateFilters} loading={loading} />
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <Typography variant="h6">Books Collection</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? <Skeleton width={200} /> : `Showing ${books.length} of ${pagination.totalItems} books`}
          </Typography>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" text="Loading books..." />
          ) : books.length === 0 && pagination.totalItems === 0 ? (
            <EmptyState
              type="no-books"
              title="No Books Yet"
              description="Start building your library by adding your first book to the collection."
              action={{
                label: "Add First Book",
                onClick: () => setShowAddModal(true),
              }}
            />
          ) : (
            <BookTable
              books={books}
              loading={loading}
              pagination={pagination}
              onPageChange={goToPage}
              onRefresh={refreshBooks}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              onViewBook={handleViewBook}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals and Dialogs */}
      <BookFormModal
        open={showAddModal || editingBook !== null}
        onOpenChange={handleCloseModal}
        book={editingBook}
        onSuccess={handleModalSuccess}
      />

      <DeleteBookDialog
        open={deletingBook !== null}
        onOpenChange={handleCloseDeleteDialog}
        book={deletingBook}
        onSuccess={handleDeleteSuccess}
      />

      <BookDetailModal open={viewingBook !== null} onOpenChange={handleCloseDetailModal} book={viewingBook} />
    </Box>
  )
}
