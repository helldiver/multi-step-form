'use client'

import { RefObject } from 'react'
import { useTableStore } from '@/stores/simpleTableStore'
import type { DataTableRef } from './SimpleTable'

interface TableControlsProps {
  tableRef?: RefObject<DataTableRef>
}

const TableControls = ({ tableRef }: TableControlsProps) => {
  // !important：🔧 使用 useTableStore selector 避免不必要的重渲染
  const selectedRows = useTableStore((state) => state.selectedRows)
  const selectAll = useTableStore((state) => state.selectAll)
  const clearSelection = useTableStore((state) => state.clearSelection)
  const isAllSelected = useTableStore((state) => state.isAllSelected)
  const isIndeterminate = useTableStore((state) => state.isIndeterminate)
  const getSelectedCount = useTableStore((state) => state.getSelectedCount)

  // 🔧 修正：全選操作 - 直接調用 store 方法，讓 useEffect 處理同步
  const handleSelectAll = () => {
    console.log('🔵 執行全選操作')
    selectAll()
  }

  // 🔧 修正：清空選擇操作
  const handleClearSelection = () => {
    console.log('🔴 執行清空選擇操作')
    clearSelection()
  }

  // 🔧 測試 store 狀態的函數
  const handleTestStore = () => {
    const state = useTableStore.getState()
    console.log('🧪 測試 Store 狀態:')
    console.log('- selectedRows:', state.selectedRows)
    console.log('- allRows:', state.allRows)
    console.log('- selectedCount:', state.getSelectedCount())
    console.log('- isAllSelected:', state.isAllSelected())
    console.log('- isIndeterminate:', state.isIndeterminate())
  }

  const selectedCount = getSelectedCount()
  const allSelected = isAllSelected()
  const indeterminate = isIndeterminate()

  return (
    <div className='flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg'>
      <h3 className='w-full text-lg font-semibold text-gray-700 mb-2'>表格控制 (Zustand 管理)</h3>

      {/* 主要控制按鈕 */}
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={handleSelectAll}
          disabled={allSelected}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
        >
          全選 {allSelected ? '(已全選)' : ''}
        </button>

        <button
          onClick={handleClearSelection}
          disabled={selectedCount === 0}
          className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
        >
          清空選擇
        </button>
      </div>

      {/* 狀態顯示 */}
      <div className='w-full flex flex-wrap items-center gap-4 mt-2'>
        <span className='px-3 py-2 bg-white text-gray-700 rounded border text-sm font-medium'>
          已選擇: <span className='text-blue-600'>{selectedCount}</span> 筆
        </span>

        <span className='px-3 py-2 bg-white text-gray-700 rounded border text-sm'>
          狀態:{' '}
          <span
            className={`font-medium ${
              allSelected ? 'text-green-600' : indeterminate ? 'text-orange-600' : 'text-gray-600'
            }`}
          >
            {allSelected ? '全選' : indeterminate ? '部分選擇' : '未選擇'}
          </span>
        </span>
      </div>

      {/* 除錯按鈕 */}
      <div className='w-full flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200'>
        <h4 className='w-full text-sm font-semibold text-gray-600'>除錯工具:</h4>

        <button
          onClick={handleTestStore}
          className='px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm transition-colors'
        >
          測試 Store 狀態
        </button>

        <button
          onClick={() => console.log('📋 目前選中的資料:', selectedRows)}
          disabled={selectedCount === 0}
          className='px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors'
        >
          查看選中資料
        </button>

        <button
          onClick={() => {
            console.log('🔄 手動觸發同步')
            tableRef?.current?.syncSelectionFromStore()
          }}
          className='px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm transition-colors'
        >
          手動同步
        </button>
      </div>
    </div>
  )
}

export default TableControls
