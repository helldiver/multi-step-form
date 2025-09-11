import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TableRowData, TableState, CreateRowData } from '@/types/dataTable'

interface DataTableStore extends TableState {
  // 資料操作
  setData: (data: TableRowData[]) => void
  addRow: (newRow: CreateRowData) => void
  deleteRows: (ids: string[]) => void
  updateRow: (id: string, updates: Partial<TableRowData>) => void

  // 選擇操作
  setSelectedRows: (ids: string[]) => void
  selectRow: (id: string) => void
  deselectRow: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleRowSelection: (id: string) => void

  // 狀態操作
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 計算屬性
  getSelectedRowsData: () => TableRowData[]
  hasSelectedRows: () => boolean
  isAllSelected: () => boolean

  // API 操作
  fetchData: () => Promise<void>
  createRow: (data: CreateRowData) => Promise<void>
  deleteSelectedRows: () => Promise<void>
}

export const useDataTableStore = create<DataTableStore>()(
  persist(
    (set, get) => ({
      // 初始狀態
      data: [],
      selectedRows: [],
      isLoading: false,
      error: null,

      // 資料操作
      setData: (data) => set({ data }),

      addRow: (newRow) => {
        const row: TableRowData = {
          id: Date.now().toString(),
          ...newRow,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          data: [...state.data, row],
        }))
      },

      deleteRows: (ids) => {
        set((state) => ({
          data: state.data.filter((row) => !ids.includes(row.id)),
          selectedRows: state.selectedRows.filter((id) => !ids.includes(id)),
        }))
      },

      updateRow: (id, updates) => {
        set((state) => ({
          data: state.data.map((row) => (row.id === id ? { ...row, ...updates, updatedAt: new Date() } : row)),
        }))
      },

      // 選擇操作
      setSelectedRows: (ids) => set({ selectedRows: ids }),

      selectRow: (id) => {
        set((state) => ({
          selectedRows: state.selectedRows.includes(id) ? state.selectedRows : [...state.selectedRows, id],
        }))
      },

      deselectRow: (id) => {
        set((state) => ({
          selectedRows: state.selectedRows.filter((selectedId) => selectedId !== id),
        }))
      },

      selectAll: () => {
        const { data } = get()
        set({ selectedRows: data.map((row) => row.id) })
      },

      deselectAll: () => set({ selectedRows: [] }),

      toggleRowSelection: (id) => {
        const { selectedRows } = get()
        if (selectedRows.includes(id)) {
          get().deselectRow(id)
        } else {
          get().selectRow(id)
        }
      },

      // 狀態操作
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // 計算屬性
      getSelectedRowsData: () => {
        const { data, selectedRows } = get()
        return data.filter((row) => selectedRows.includes(row.id))
      },

      hasSelectedRows: () => {
        const { selectedRows } = get()
        return selectedRows.length > 0
      },

      isAllSelected: () => {
        const { data, selectedRows } = get()
        return data.length > 0 && selectedRows.length === data.length
      },

      // API 操作
      fetchData: async () => {
        set({ isLoading: true, error: null })
        try {
          // 模擬 API 調用
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const mockData: TableRowData[] = [
            {
              id: '1',
              title1: '項目 A',
              title2: '描述 A',
              status: 'active',
              category: '類別 1',
              value: 100,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: '2',
              title1: '項目 B',
              title2: '描述 B',
              status: 'inactive',
              category: '類別 2',
              value: 200,
              createdAt: new Date('2024-01-02'),
              updatedAt: new Date('2024-01-02'),
            },
            {
              id: '3',
              title1: '項目 C',
              title2: '描述 C',
              status: 'pending',
              category: '類別 1',
              value: 150,
              createdAt: new Date('2024-01-03'),
              updatedAt: new Date('2024-01-03'),
            },
          ]

          set({ data: mockData, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '載入資料失敗',
            isLoading: false,
          })
        }
      },

      createRow: async (newRowData) => {
        set({ isLoading: true, error: null })
        try {
          // 模擬 API 調用
          await new Promise((resolve) => setTimeout(resolve, 500))

          get().addRow(newRowData)
          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '新增資料失敗',
            isLoading: false,
          })
        }
      },

      deleteSelectedRows: async () => {
        const { selectedRows } = get()
        if (selectedRows.length === 0) return

        set({ isLoading: true, error: null })
        try {
          // 模擬 API 調用
          await new Promise((resolve) => setTimeout(resolve, 500))

          get().deleteRows(selectedRows)
          set({ isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '刪除資料失敗',
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'data-table-storage',
      partialize: (state) => ({
        data: state.data,
        selectedRows: state.selectedRows,
      }),
    }
  )
)
