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

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  status: "Active" | "Inactive"
  joinDate: string
  booksIssued: number
}

export interface MemberFormData {
  name: string
  email: string
  phone: string
  status: "Active" | "Inactive"
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

export interface ActivityRecord {
  id: string
  type: "Borrow" | "Return" | "Register" | "Update"
  description: string
  user: string
  timestamp: string
  status: "Success" | "Pending" | "Failed"
}

export interface ReportData {
  id: string
  title: string
  type: "PDF" | "Excel" | "CSV"
  generatedDate: string
  status: "Ready" | "Generating" | "Failed"
}
