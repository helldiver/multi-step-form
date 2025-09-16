import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// 定義選擇狀態的介面
interface TableSelectionState<T extends object = Record<string, unknown>> {
  // 選中的資料
  selectedRows: T[]
  // 所有可選的資料
  allRows: T[]
  // 設定選中的資料
  setSelectedRows: (rows: T[]) => void
  // 設定所有資料
  setAllRows: (rows: T[]) => void
  // 清空選擇
  clearSelection: () => void
  // 全選
  selectAll: () => void
  // 取消全選
  deselectAll: () => void
  // 切換特定行的選擇狀態
  toggleRowSelection: (row: T, idField?: string) => void
  // 檢查是否全選
  isAllSelected: () => boolean
  // 檢查是否有部分選中
  isIndeterminate: () => boolean
  // 獲取選中的數量
  getSelectedCount: () => number
  // 檢查特定行是否被選中
  isRowSelected: (row: T, idField?: string) => boolean
}

// 建立 Zustand store
export const useTableStore = create<TableSelectionState>()(
  devtools(
    (set, get) => ({
      selectedRows: [],
      allRows: [],

      setSelectedRows: (rows) => {
        set({ selectedRows: rows }, false, 'setSelectedRows')
      },

      setAllRows: (rows) => {
        set({ allRows: rows }, false, 'setAllRows')
      },

      clearSelection: () => {
        set({ selectedRows: [] }, false, 'clearSelection')
      },

      selectAll: () => {
        const { allRows } = get()
        set({ selectedRows: [...allRows] }, false, 'selectAll')
      },

      deselectAll: () => {
        set({ selectedRows: [] }, false, 'deselectAll')
      },

      toggleRowSelection: (row, idField = 'id') => {
        const { selectedRows, isRowSelected } = get()
        if (isRowSelected(row, idField)) {
          // 移除選擇
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newSelected = selectedRows.filter((selectedRow: any) => selectedRow[idField] !== (row as any)[idField])
          set({ selectedRows: newSelected }, false, 'toggleRowSelection')
        } else {
          // 添加選擇
          set({ selectedRows: [...selectedRows, row] }, false, 'toggleRowSelection')
        }
      },

      isAllSelected: () => {
        const { selectedRows, allRows } = get()
        return allRows.length > 0 && selectedRows.length === allRows.length
      },

      isIndeterminate: () => {
        const { selectedRows, allRows, isAllSelected } = get()
        return selectedRows.length > 0 && selectedRows.length < allRows.length && !isAllSelected()
      },

      getSelectedCount: () => {
        const { selectedRows } = get()
        return selectedRows.length
      },

      isRowSelected: (row, idField = 'id') => {
        const { selectedRows } = get()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selectedRows.some((selectedRow: any) => selectedRow[idField] === (row as any)[idField])
      },
    }),
    {
      name: 'table-selection-store',
    }
  )
)
