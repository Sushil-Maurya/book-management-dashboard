"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { booksApi } from "@/lib/api"
import type { Book } from "@/lib/types"

interface DeleteBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
  onSuccess: () => void
}

export function DeleteBookDialog({ open, onOpenChange, book, onSuccess }: DeleteBookDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!book) return

    try {
      setLoading(true)
      await booksApi.deleteBook(book.id)

      toast({
        title: "Success",
        description: `"${book.title}" has been deleted successfully`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete book",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">Delete Book</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Are you sure you want to delete this book? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {book && (
          <div className="my-4 p-4 bg-muted rounded-lg border">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-card-foreground">Title:</span>{" "}
                <span className="text-foreground">{book.title}</span>
              </div>
              <div>
                <span className="font-medium text-card-foreground">Author:</span>{" "}
                <span className="text-foreground">{book.author}</span>
              </div>
              <div>
                <span className="font-medium text-card-foreground">Genre:</span>{" "}
                <span className="text-foreground">{book.genre}</span>
              </div>
              <div>
                <span className="font-medium text-card-foreground">Status:</span>{" "}
                <span className={`font-medium ${book.status === "Available" ? "text-green-600" : "text-orange-600"}`}>
                  {book.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Book
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
