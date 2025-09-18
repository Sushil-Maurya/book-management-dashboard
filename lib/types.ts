export interface Book {
  id: string
  title: string
  author: string
  genre: string
  publishedYear: number
  status: "Available" | "Issued"
  isbn?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface BookFormData {
  title: string
  author: string
  genre: string
  publishedYear: number
  status: "Available" | "Issued"
  isbn?: string
  description?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface BookFilters {
  search: string
  genre: string
  status: string
}
