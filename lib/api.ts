import type { Book, BookFormData } from "./types"

// Mock API base URL - using JSONPlaceholder as a fallback
const API_BASE_URL = "https://jsonplaceholder.typicode.com"

// Mock data for development
const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    publishedYear: 1925,
    status: "Available",
    isbn: "978-0-7432-7356-5",
    description: "A classic American novel set in the Jazz Age.",
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    publishedYear: 1960,
    status: "Issued",
    isbn: "978-0-06-112008-4",
    description: "A gripping tale of racial injustice and childhood innocence.",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    publishedYear: 1949,
    status: "Available",
    isbn: "978-0-452-28423-4",
    description: "A dystopian social science fiction novel.",
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    publishedYear: 1813,
    status: "Available",
    isbn: "978-0-14-143951-8",
    description: "A romantic novel of manners.",
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    publishedYear: 1951,
    status: "Issued",
    isbn: "978-0-316-76948-0",
    description: "A controversial novel about teenage rebellion.",
  },
  {
    id: "6",
    title: "Lord of the Flies",
    author: "William Golding",
    genre: "Fiction",
    publishedYear: 1954,
    status: "Available",
    isbn: "978-0-571-05686-2",
    description: "A novel about British boys stranded on an uninhabited island.",
  },
  {
    id: "7",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    publishedYear: 1937,
    status: "Available",
    isbn: "978-0-547-92822-7",
    description: "A fantasy adventure novel.",
  },
  {
    id: "8",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    genre: "Science Fiction",
    publishedYear: 1953,
    status: "Issued",
    isbn: "978-1-4516-7331-9",
    description: "A dystopian novel about a future where books are banned.",
  },
  {
    id: "9",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    genre: "Gothic Fiction",
    publishedYear: 1847,
    status: "Available",
    isbn: "978-0-14-144114-6",
    description: "A coming-of-age novel with gothic elements.",
  },
  {
    id: "10",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    publishedYear: 1954,
    status: "Available",
    isbn: "978-0-544-00341-5",
    description: "An epic high fantasy novel.",
  },
  {
    id: "11",
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Science Fiction",
    publishedYear: 1932,
    status: "Issued",
    isbn: "978-0-06-085052-4",
    description: "A dystopian novel set in a futuristic World State.",
  },
  {
    id: "12",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    genre: "Gothic Fiction",
    publishedYear: 1847,
    status: "Available",
    isbn: "978-0-14-143955-6",
    description: "A tale of passion and revenge on the Yorkshire moors.",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const booksApi = {
  // Get all books with pagination and filters
  async getBooks(
    page = 1,
    limit = 10,
    filters?: { search?: string; genre?: string; status?: string },
  ): Promise<{ books: Book[]; total: number }> {
    await delay(800) // Simulate network delay

    let filteredBooks = [...mockBooks]

    // Apply filters
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredBooks = filteredBooks.filter(
        (book) => book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm),
      )
    }

    if (filters?.genre && filters.genre !== "all") {
      filteredBooks = filteredBooks.filter((book) => book.genre === filters.genre)
    }

    if (filters?.status && filters.status !== "all") {
      filteredBooks = filteredBooks.filter((book) => book.status === filters.status)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

    return {
      books: paginatedBooks,
      total: filteredBooks.length,
    }
  },

  // Get a single book by ID
  async getBook(id: string): Promise<Book | null> {
    await delay(500)
    return mockBooks.find((book) => book.id === id) || null
  },

  // Create a new book
  async createBook(bookData: BookFormData): Promise<Book> {
    await delay(1000)
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockBooks.push(newBook)
    return newBook
  },

  // Update an existing book
  async updateBook(id: string, bookData: Partial<BookFormData>): Promise<Book> {
    await delay(1000)
    const bookIndex = mockBooks.findIndex((book) => book.id === id)
    if (bookIndex === -1) {
      throw new Error("Book not found")
    }

    mockBooks[bookIndex] = {
      ...mockBooks[bookIndex],
      ...bookData,
      updatedAt: new Date().toISOString(),
    }

    return mockBooks[bookIndex]
  },

  // Delete a book
  async deleteBook(id: string): Promise<void> {
    await delay(800)
    const bookIndex = mockBooks.findIndex((book) => book.id === id)
    if (bookIndex === -1) {
      throw new Error("Book not found")
    }
    mockBooks.splice(bookIndex, 1)
  },

  // Get unique genres for filter dropdown
  async getGenres(): Promise<string[]> {
    await delay(300)
    const genres = [...new Set(mockBooks.map((book) => book.genre))]
    return genres.sort()
  },
}
