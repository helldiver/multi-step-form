'use client'

import { useCallback, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { useTableStore } from '@/stores/tableStore'
import type { Ref } from 'react'
import type { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'

// 定義表格 props 的型別
interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: ColDef[]
  height?: string
  className?: string
  defaultColDef?: ColDef
  idField?: string
  onSelectionChange?: (selectedRows: T[]) => void
}

// 暴露給父組件的方法
export interface DataTableRef {
  getGridApi: () => GridApi | undefined
  syncSelectionFromStore: () => void
}

// 使用 Zustand 的 DataTable 組件
const SimpleTable = forwardRef<DataTableRef, DataTableProps>(function DataTableWithZustand<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  {
    data,
    columns,
    height = '400px',
    className = '',
    defaultColDef = {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
    },
    idField = 'id',
    onSelectionChange,
  }: DataTableProps<T>,
  ref: Ref<DataTableRef>
) {
  const gridRef = useRef<AgGridReact>(null)
  const gridApiRef = useRef<GridApi | null>(null)
  const isUpdatingFromStore = useRef(false)
  const isInitialized = useRef(false)

  // !important：🔧 使用 useTableStore selector 避免不必要的重渲染
  const setSelectedRows = useTableStore((state) => state.setSelectedRows)
  const setAllRows = useTableStore((state) => state.setAllRows)
  const selectedRows = useTableStore((state) => state.selectedRows)

  // 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    getGridApi: () => gridApiRef.current || undefined,
    syncSelectionFromStore: () => {
      syncGridSelectionFromStore()
    },
  }))

  // 🔧 修正：從 ag-Grid 同步到 Store
  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      if (isUpdatingFromStore.current) {
        console.log('⏭️ 跳過程式化更新觸發的選擇事件')
        return
      }

      console.log('🔔 用戶操作觸發 ag-Grid 選擇變更')
      const selectedGridRows = event.api.getSelectedRows()
      console.log('📋 選中的資料:', selectedGridRows.length, '筆')

      // 🔧 直接更新 store，不要觸發循環
      setSelectedRows(selectedGridRows)
      onSelectionChange?.(selectedGridRows)
      console.log('✅ 已同步到 Zustand store')
    },
    [setSelectedRows, onSelectionChange]
  )

  // 🔧 修正：從 Store 同步到 ag-Grid
  const syncGridSelectionFromStore = useCallback(() => {
    const gridApi = gridApiRef.current
    if (!gridApi || !isInitialized.current) {
      console.log('❌ Grid API 尚未準備就緒或未初始化')
      return
    }

    console.log('🔄 同步 store 選擇到 ag-Grid:', selectedRows.length, '筆')

    isUpdatingFromStore.current = true

    try {
      // 先清除所有選擇
      gridApi.deselectAll()

      // 如果有選中的資料，設定選中狀態
      if (selectedRows.length > 0) {
        gridApi.forEachNode((node) => {
          if (node.data) {
            const isSelected = selectedRows.some((row) => row[idField] === node.data[idField])
            if (isSelected) {
              node.setSelected(true)
            }
          }
        })
      }
      console.log('✅ ag-Grid 同步完成')
    } catch (error) {
      console.error('❌ 同步過程中發生錯誤:', error)
    } finally {
      // 使用 setTimeout 確保同步操作完成後再允許用戶操作
      setTimeout(() => {
        isUpdatingFromStore.current = false
        console.log('🔓 解除更新鎖定')
      }, 0)
    }
  }, [selectedRows, idField])

  // 🔧 修正：資料變更時只更新 allRows，不清空選擇
  useEffect(() => {
    console.log('📊 更新 allRows 到 store:', data.length, '筆資料')
    setAllRows(data)
  }, [data, setAllRows])

  // 🔧 新增：監聽 store 選擇變更並同步到 grid
  useEffect(() => {
    if (isInitialized.current && !isUpdatingFromStore.current) {
      console.log('🔄 Store 選擇變更，同步到 grid')
      syncGridSelectionFromStore()
    }
  }, [selectedRows, syncGridSelectionFromStore])

  // 合併 columns 配置
  const columnDefs = useMemo(() => {
    const checkboxColumn: ColDef = {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      width: 50,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      flex: 0,
    }

    return [checkboxColumn, ...columns]
  }, [columns])

  // 🔧 修正：Grid 準備就緒事件
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api
    console.log('🚀 Grid API 已準備就緒')

    // 🔧 初始化時清空選擇
    useTableStore.getState().clearSelection()

    // 設置為已初始化
    isInitialized.current = true
    console.log('🏁 Table 初始化完成')
  }, [])

  return (
    <div className={`ag-theme-alpine ${className}`} style={{ height }}>
      <AgGridReact
        ref={gridRef}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection='multiple'
        suppressRowClickSelection={true}
        onSelectionChanged={handleSelectionChanged}
        onGridReady={onGridReady}
        animateRows={true}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        rowMultiSelectWithClick={false}
        suppressRowDeselection={false}
        // 🔧 新增：確保選擇框可以正常工作
        suppressAggFuncInHeader={true}
      />
    </div>
  )
})

export default SimpleTable
