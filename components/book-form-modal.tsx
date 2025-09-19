"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
// import { booksApi } from "@/lib/api"
import type { Book } from "@/lib/types"
import { useBooks } from "@/hooks/use-books"

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  author: z.string().min(1, "Author is required").max(100, "Author must be less than 100 characters"),
  genre: z.string().min(1, "Genre is required"),
  publishedYear: z
    .number()
    .min(1000, "Year must be at least 1000")
    .max(new Date().getFullYear(), `Year cannot be later than ${new Date().getFullYear()}`),
  status: z.enum(["Available", "Issued"], {
    required_error: "Status is required",
  }),
  isbn: z.string().optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  book?: Book | null
  onSuccess: (values: BookFormValues) => void
  getGenres: () => string[]
}

export function BookFormModal({ open, onClose, book, onSuccess ,getGenres}: BookFormModalProps) {

  const [loading, setLoading] = useState(false)
  const genres = getGenres()
  const { toast } = useToast()

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      publishedYear: new Date().getFullYear(),
      status: "Available",
      isbn: "",
      description: "",
    },
  })

  
  useEffect(() => {
    if (open) {
      if (book) {
        form.reset({
          title: book.title,
          author: book.author,
          genre: book.genre,
          publishedYear: book.publishedYear,
          status: book.status,
          isbn: book.isbn || "",
          description: book.description || "",
        })
      } else {
        form.reset({
          title: "",
          author: "",
          genre: "",
          publishedYear: new Date().getFullYear(),
          status: "Available",
          isbn: "",
          description: "",
        })
      }
    }
  }, [open, book, form])

  const onSubmit = async (values: BookFormValues) => {
    try {
      setLoading(true)

      // if (book) {
      //   await updateBook(book.id, values)
      //   toast({
      //     title: "Success",
      //     description: "Book updated successfully",
      //   })
      // } else {
      //   await createBook(values)
      //   toast({
      //     title: "Success",
      //     description: "Book added successfully",
      //   })
      // }

      onSuccess(values)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const defaultGenres = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Romance",
    "Thriller",
    "Biography",
    "History",
    "Self-Help",
  ]

  const allGenres = [...genres, ...defaultGenres].filter((genre, index, arr) => arr.indexOf(genre) === index)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author */}
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Genre */}
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allGenres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Published Year */}
              <FormField
                control={form.control}
                name="publishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Year *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter year"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Issued">Issued</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ISBN */}
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ISBN (optional)" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter book description (optional)" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : book ? "Update Book" : "Add Book"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}