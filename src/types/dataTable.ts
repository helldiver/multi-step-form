export interface TableRowData {
  id: string
  title1: string
  title2: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'inactive' | 'pending'
  category: string
  value: number
}

export interface TableState {
  data: TableRowData[]
  selectedRows: string[]
  isLoading: boolean
  error: string | null
}

export interface CreateRowData {
  title1: string
  title2: string
  status: 'active' | 'inactive' | 'pending'
  category: string
  value: number
}
