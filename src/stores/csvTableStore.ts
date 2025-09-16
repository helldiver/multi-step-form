import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { CsvRow } from '@/utils/csvFileUtils'

// 🎯 CSV 表格狀態管理介面
interface CsvTableState {
  // 數據狀態
  allRows: CsvRow[]
  selectedRows: CsvRow[]
  isLoading: boolean
  error: string | null

  // 動作方法
  setAllRows: (rows: CsvRow[]) => void
  addRows: (rows: CsvRow[]) => void
  setSelectedRows: (rows: CsvRow[]) => void
  removeSelectedRows: () => void
  clearAllData: () => void
  clearSelection: () => void
  selectAll: () => void
  deselectAll: () => void
  toggleRowSelection: (row: CsvRow) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 計算屬性方法
  getSelectedCount: () => number
  getTotalCount: () => number
  isAllSelected: () => boolean
  isIndeterminate: () => boolean
  isRowSelected: (row: CsvRow) => boolean
  getUnselectedRows: () => CsvRow[]
}

// 🎯 純函數：輔助工具
const findRowIndex = (rows: CsvRow[], targetRow: CsvRow): number =>
  rows.findIndex((row) => row.id === targetRow.id)

const isRowInArray = (rows: CsvRow[], targetRow: CsvRow): boolean => findRowIndex(rows, targetRow) !== -1

const removeRowFromArray = (rows: CsvRow[], targetRow: CsvRow): CsvRow[] =>
  rows.filter((row) => row.id !== targetRow.id)

const addUniqueRow = (rows: CsvRow[], newRow: CsvRow): CsvRow[] =>
  isRowInArray(rows, newRow) ? rows : [...rows, newRow]

// 🎯 建立 Zustand Store
export const useCsvTableStore = create<CsvTableState>()(
  devtools(
    (set, get) => ({
      // 初始狀態
      allRows: [],
      selectedRows: [],
      isLoading: false,
      error: null,

      // 🎯 數據管理動作
      setAllRows: (rows) => {
        set(
          {
            allRows: [...rows],
            selectedRows: [], // 新數據時清空選擇
            error: null,
          },
          false,
          'setAllRows'
        )
      },

      addRows: (newRows) => {
        const { allRows } = get()
        const mergedRows = [...allRows, ...newRows]
        set(
          {
            allRows: mergedRows,
            error: null,
          },
          false,
          'addRows'
        )
      },

      setSelectedRows: (rows) => {
        set({ selectedRows: rows }, false, 'setSelectedRows')
      },

      removeSelectedRows: () => {
        const { allRows, selectedRows } = get()
        const remainingRows = allRows.filter((row) => !selectedRows.some((selected) => selected.id === row.id))
        set(
          {
            allRows: remainingRows,
            selectedRows: [],
          },
          false,
          'removeSelectedRows'
        )
      },

      clearAllData: () => {
        set(
          {
            allRows: [],
            selectedRows: [],
            error: null,
          },
          false,
          'clearAllData'
        )
      },

      // 🎯 選擇管理動作
      clearSelection: () => {
        set({ selectedRows: [] }, false, 'clearSelection')
      },

      selectAll: () => {
        const { allRows } = get()
        set({ selectedRows: allRows }, false, 'selectAll')
      },

      deselectAll: () => {
        set({ selectedRows: [] }, false, 'deselectAll')
      },

      toggleRowSelection: (row) => {
        const { selectedRows } = get()
        const isSelected = isRowInArray(selectedRows, row)

        const newSelectedRows = isSelected ? removeRowFromArray(selectedRows, row) : addUniqueRow(selectedRows, row)

        set({ selectedRows: newSelectedRows }, false, 'toggleRowSelection')
      },

      // 🎯 狀態管理動作
      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },

      setError: (error) => {
        set({ error }, false, 'setError')
      },

      // 🎯 計算屬性方法
      getSelectedCount: () => {
        const { selectedRows } = get()
        return selectedRows.length
      },

      getTotalCount: () => {
        const { allRows } = get()
        return allRows.length
      },

      isAllSelected: () => {
        const { allRows, selectedRows } = get()
        return allRows.length > 0 && selectedRows.length === allRows.length
      },

      isIndeterminate: () => {
        const { selectedRows, isAllSelected } = get()
        return selectedRows.length > 0 && !isAllSelected()
      },

      isRowSelected: (row) => {
        const { selectedRows } = get()
        return isRowInArray(selectedRows, row)
      },

      getUnselectedRows: () => {
        const { allRows, selectedRows } = get()
        return allRows.filter((row) => !selectedRows.some((selected) => selected.id === row.id))
      },
    }),
    {
      name: 'csv-table-store',
    }
  )
)
