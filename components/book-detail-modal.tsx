"use client"

import { Calendar, User, Tag, Hash, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Book } from "@/lib/types"

interface BookDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
}

export function BookDetailModal({ open, onOpenChange, book }: BookDetailModalProps) {
  if (!book) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-balance">{book.title}</DialogTitle>
          <DialogDescription>Complete book information and details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant={book.status === "Available" ? "default" : "secondary"}
              className={`text-sm px-4 py-2 ${
                book.status === "Available"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-100"
              }`}
            >
              {book.status}
            </Badge>
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Author</p>
                <p className="text-foreground">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Genre</p>
                <Badge variant="outline">{book.genre}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Year</p>
                <p className="text-foreground">{book.publishedYear}</p>
              </div>
            </div>

            {book.isbn && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISBN</p>
                  <p className="text-foreground font-mono text-sm">{book.isbn}</p>
                </div>
              </div>
            )}

            {book.description && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-foreground text-sm leading-relaxed">{book.description}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Metadata */}
          {(book.createdAt || book.updatedAt) && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                {book.createdAt && <p>Added: {new Date(book.createdAt).toISOString().slice(0, 10)}</p>}
                {book.updatedAt && book.updatedAt !== book.createdAt && (
                  <p>Last updated: {new Date(book.updatedAt).toISOString().slice(0, 10)}</p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
