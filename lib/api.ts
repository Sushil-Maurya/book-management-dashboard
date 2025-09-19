import axios from "axios"
import type { Book, BookFormData } from "./types"

const BASE_URL = "https://crudcrud.com/api/9e96800dde894c34a47a7d602bbff73e"
const BOOKS_ENDPOINT = `${BASE_URL}/books`

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
    const { data } = await axios.get<CrudCrudBook[]>(BOOKS_ENDPOINT)
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
    const { data } = await axios.get<CrudCrudBook>(`${BOOKS_ENDPOINT}/${id}`)
    return data ? mapFromCrud(data) : null
  },

  async createBook(bookData: BookFormData): Promise<Book> {
    const payload = {
      ...bookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const { data } = await axios.post<CrudCrudBook>(BOOKS_ENDPOINT, payload)
    return mapFromCrud(data)
  },

  async updateBook(id: string, bookData: Partial<BookFormData>): Promise<Book> {
    // CrudCrud requires PUT to replace the document without _id
    const current = await axios.get<CrudCrudBook>(`${BOOKS_ENDPOINT}/${id}`)
    const updated = {
      ...current.data,
      ...bookData,
      updatedAt: new Date().toISOString(),
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...putBody } = updated
    await axios.put(`${BOOKS_ENDPOINT}/${id}`, putBody)
    return mapFromCrud({ ...(putBody as any), _id: id })
  },

  async deleteBook(id: string): Promise<void> {
    await axios.delete(`${BOOKS_ENDPOINT}/${id}`)
  },

  async getGenres(): Promise<string[]> {
    const { data } = await axios.get<CrudCrudBook[]>(BOOKS_ENDPOINT)
    const genres = [...new Set(data.map((b) => b.genre))]
    return genres.sort()
  },
}
