// Shared OpenAPI-derived types (no any)

export interface ApiResponse<T> {
  code: number
  msg?: string
  data?: T
}

export interface PageData<T> {
  total: number
  list: T[]
}

export type Id = string | number

