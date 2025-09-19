import axios from "axios"
import type { Book, BookFormData } from "./types"
import { requestWithRotation } from "./crudcrud"

type CrudCrudBook = Omit<Book, "id"> & { _id: string }

function mapFromCrud(b: CrudCrudBook): Book {
  return {
    id: b._id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    publishedYear: Number(b.publishedYear),
    status: b.status,
    isbn: b.isbn,
    description: b.description,
    createdAt: b["createdAt" as keyof CrudCrudBook] as any,
    updatedAt: b["updatedAt" as keyof CrudCrudBook] as any,
  }
}

export const booksApi = {
  async getBooks(
    page = 1,
    limit = 10,
    filters?: { search?: string; genre?: string; status?: string },
  ): Promise<{ books: Book[]; total: number }> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/books`
      const res = await axios.get<CrudCrudBook[]>(url)
      return res.data
    })
    let all = data.map(mapFromCrud)

    // client-side filters
    if (filters?.search) {
      const term = filters.search.toLowerCase()
      all = all.filter((b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term))
    }
    if (filters?.genre && filters.genre !== "all") {
      all = all.filter((b) => b.genre === filters.genre)
    }
    if (filters?.status && filters.status !== "all") {
      all = all.filter((b) => b.status === filters.status)
    }

    const total = all.length
    const start = (page - 1) * limit
    const end = start + limit
    return { books: all.slice(start, end), total }
  },

  async getBook(id: string): Promise<Book | null> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/books/${id}`
      const res = await axios.get<CrudCrudBook>(url)
      return res.data
    })
    return data ? mapFromCrud(data) : null
  },

  async createBook(bookData: BookFormData): Promise<Book> {
    const payload = {
      ...bookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/books`
      const res = await axios.post<CrudCrudBook>(url, payload)
      return res.data
    })
    return mapFromCrud(data)
  },

  async updateBook(id: string, bookData: Partial<BookFormData>): Promise<Book> {
    // CrudCrud requires PUT to replace the document without _id
    return await requestWithRotation(async (base) => {
      const getUrl = `${base}/books/${id}`
      const current = await axios.get<CrudCrudBook>(getUrl)
      const updated = {
        ...current.data,
        ...bookData,
        updatedAt: new Date().toISOString(),
      }
      const { _id, ...putBody } = updated as any
      const putUrl = `${base}/books/${id}`
      await axios.put(putUrl, putBody)
      return mapFromCrud({ ...(putBody as any), _id: id })
    })
  },

  async deleteBook(id: string): Promise<void> {
    await requestWithRotation(async (base) => {
      const url = `${base}/books/${id}`
      await axios.delete(url)
      return null as any
    })
  },

  async getGenres(): Promise<string[]> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/books`
      const res = await axios.get<CrudCrudBook[]>(url)
      return res.data
    })
    const genres = [...new Set(data.map((b) => b.genre))]
    return genres.sort()
  },
}
