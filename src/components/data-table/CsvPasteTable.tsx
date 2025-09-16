'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'
import {
  Trash2 as TrashIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Copy as CopyIcon
} from 'lucide-react'
import {
  CsvRow,
  readCsvFile,
  parseCsvText,
  exportDataToCsv,
  copyExampleCsv,
  downloadExampleCsv,
  type CsvParseResult,
} from '@/utils/csvFileUtils'
import type { ChangeEvent } from 'react'
import { useCsvTableStore } from '@/stores/csvTableStore'
import useNotification from '@/hooks/useNotification'

// Import ag-Grid styles
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

interface CsvPasteTableProps {
  initialData?: CsvRow[]
  onDataChange?: (data: CsvRow[]) => void
  onSelectionChange?: (selectedRows: readonly CsvRow[]) => void
  height?: string
  className?: string
}

// 暴露給父組件的方法
export interface CsvTableRef {
  getGridApi: () => GridApi | undefined
  syncSelectionFromStore: () => void
}

// 🎯 純函數：生成列定義
const generateColumnDefs = (data: readonly CsvRow[]): ColDef[] => {
  if (data.length === 0) return []

  const firstRow = data[0]

  // Checkbox 選擇列
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

  // 數據列
  const dataColumns: ColDef[] = Object.keys(firstRow)
    .filter((key) => key !== 'id')
    .map((key) => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      editable: true,
      cellEditor: typeof firstRow[key] === 'number' ? 'agNumberCellEditor' : 'agTextCellEditor',
    }))

  return [checkboxColumn, ...dataColumns]
}

const CsvPasteTable = forwardRef<CsvTableRef, CsvPasteTableProps>(function CsvPasteTable(
  { initialData = [], onDataChange, onSelectionChange, height = '500px', className = '' },
  ref
) {
  // 🏗️ Refs 和 State
  const gridRef = useRef<AgGridReact>(null)
  const gridApiRef = useRef<GridApi | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isUpdatingFromStore = useRef(false)
  const [isUploading, setIsUploading] = useState(false)
  const { showSuccess, showError } = useNotification()

  // 🎯 Zustand store 狀態
  const {
    allRows,
    selectedRows,
    isLoading,
    error,
    setAllRows,
    addRows,
    setSelectedRows,
    clearAllData,
    removeSelectedRows,
    setLoading,
    setError,
    getSelectedCount,
    getTotalCount,
    isAllSelected,
    isIndeterminate,
  } = useCsvTableStore()

  // 🎯 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    getGridApi: () => gridApiRef.current || undefined,
    syncSelectionFromStore: () => {
      syncGridSelectionFromStore()
    },
  }))

  // 🎯 列定義（使用 memo 優化）
  const columnDefs = useMemo(() => generateColumnDefs(allRows), [allRows])

  // 🎯 初始化數據
  useEffect(() => {
    if (initialData.length > 0) {
      setAllRows(initialData)
    }
  }, [initialData, setAllRows])

  // 🎯 同步選擇狀態到外部
  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows, onSelectionChange])

  // 🎯 同步數據到外部
  useEffect(() => {
    onDataChange?.(allRows as CsvRow[])
  }, [allRows, onDataChange])

  // 🎯 AG-Grid 選擇變更處理
  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      if (isUpdatingFromStore.current) {
        return
      }

      const selectedGridRows = event.api.getSelectedRows() as CsvRow[]
      setSelectedRows(selectedGridRows)
    },
    [setSelectedRows]
  )

  // 🎯 從 Store 同步到 ag-Grid
  const syncGridSelectionFromStore = useCallback(() => {
    const gridApi = gridApiRef.current
    if (!gridApi) {
      return
    }

    isUpdatingFromStore.current = true

    try {
      gridApi.deselectAll()

      if (selectedRows.length > 0) {
        gridApi.forEachNode((node) => {
          if (node.data) {
            const isSelected = selectedRows.some((row) => row.id === node.data.id)
            if (isSelected) {
              node.setSelected(true)
            }
          }
        })
      }
    } catch (error) {
      // 靜默處理錯誤
      console.error('同步過程中發生錯誤:', error)
    } finally {
      setTimeout(() => {
        isUpdatingFromStore.current = false
      }, 0)
    }
  }, [selectedRows])

  // 🎯 監聽 store 選擇變更並同步到 grid
  useEffect(() => {
    if (!isUpdatingFromStore.current) {
      syncGridSelectionFromStore()
    }
  }, [selectedRows, syncGridSelectionFromStore])

  // 🎯 處理解析結果
  const handleParseResult = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (result: CsvParseResult, source: string) => {
      if (result.success && result.data) {
        if (allRows.length === 0) {
          setAllRows(result.data)
        } else {
          addRows(result.data)
        }

        showSuccess(`成功添加 ${result.data.length} 行數據！`)
        setError(null)
      } else {
        const errorMessage = result.error || '數據解析失敗'
        showError(errorMessage)
        setError(errorMessage)
      }
    },
    [allRows.length, setAllRows, addRows, showSuccess, showError, setError]
  )

  // 🎯 處理文件上傳
  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      setLoading(true)

      try {
        const result = await readCsvFile(file)
        handleParseResult(result, `文件 "${file.name}"`)
      } catch (error) {
        console.error('文件處理失敗:', error)
        showError('文件處理失敗，請重試')
        setError('文件處理失敗，請重試')
      } finally {
        setIsUploading(false)
        setLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [handleParseResult, showError, setLoading, setError]
  )

  // 🎯 處理貼上事件
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      event.preventDefault()
      const clipboardData = event.clipboardData?.getData('text')

      if (clipboardData) {
        const result = parseCsvText(clipboardData)
        handleParseResult(result, 'CSV 貼上')
      }
    },
    [handleParseResult]
  )

  // 🎯 觸發文件選擇
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // 🎯 清空所有數據
  const handleClearAllData = useCallback(() => {
    if (window.confirm('確定要清空所有數據嗎？')) {
      clearAllData()
      showSuccess('已清空所有數據')
    }
  }, [clearAllData, showSuccess])

  // 🎯 刪除選中的數據
  const handleDeleteSelected = useCallback(() => {
    const count = getSelectedCount()
    if (count === 0) {
      showError('請先選擇要刪除的數據')
      return
    }

    if (window.confirm(`確定要刪除選中的 ${count} 筆數據嗎？`)) {
      removeSelectedRows()
      showSuccess(`已刪除 ${count} 筆數據`)
    }
  }, [getSelectedCount, removeSelectedRows, showSuccess, showError])

  // 🎯 匯出 CSV
  const handleExportCsv = useCallback(() => {
    const result = exportDataToCsv(allRows as CsvRow[], `table_data_${Date.now()}`)
    if (result.success) {
      showSuccess('CSV 文件已匯出')
    } else {
      showError(result.error || '匯出失敗')
    }
  }, [allRows, showSuccess, showError])

  // 🎯 複製示例 CSV
  const handleCopyExample = useCallback(async () => {
    const result = await copyExampleCsv()
    if (result.success) {
      showSuccess('示例 CSV 已複製到剪貼簿！現在可以直接貼上到表格中。')
    } else {
      showError(result.error || '複製失敗')
    }
  }, [showSuccess, showError])

  // 🎯 下載示例文件
  const handleDownloadExample = useCallback(() => {
    try {
      downloadExampleCsv()
      showSuccess('示例文件開始下載')
    } catch (error) {
      console.error('下載過程中發生錯誤:', error)
      showError('下載失敗，請重試')
    }
  }, [showSuccess, showError])

  // 🎯 副作用：添加事件監聽器
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  // 🎯 Grid 準備就緒
  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api
  }, [])

  // 🎯 默認列設置
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
    }),
    []
  )

  return (
    <div className='space-y-4'>
      {/* 隱藏的文件輸入 */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv,text/csv'
        onChange={handleFileUpload}
        className='hidden'
        aria-label='上傳 CSV 文件'
      />

      {/* 控制面板 */}
      <div className='flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg'>
        <h3 className='w-full text-lg font-semibold text-gray-700 mb-2'>CSV 數據表格 - 支援複製貼上與文件上傳</h3>

        <div className='flex flex-wrap gap-2'>
          {/* 上傳 CSV 文件按鈕 */}
          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            <UploadIcon size={16} />
            {isUploading ? '上傳中...' : '上傳 CSV 文件'}
          </button>

          <button
            onClick={handleCopyExample}
            className='flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            <CopyIcon size={16} />
            複製示例 CSV
          </button>

          <button
            onClick={handleDownloadExample}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors'
          >
            <DownloadIcon size={16} />
            下載示例文件
          </button>

          <button
            onClick={handleExportCsv}
            disabled={getTotalCount() === 0}
            className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            <DownloadIcon size={16} />
            匯出 CSV
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={getSelectedCount() === 0}
            className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            <TrashIcon size={16} />
            刪除選中 ({getSelectedCount()})
          </button>

          <button
            onClick={handleClearAllData}
            disabled={getTotalCount() === 0}
            className='flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            <TrashIcon size={16} />
            清空所有數據
          </button>
        </div>

        <div className='w-full mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800'>
          <strong>使用說明：</strong>
          <ol className='list-decimal list-inside mt-1 space-y-1'>
            <li>
              <strong>上傳文件：</strong>點擊「上傳 CSV 文件」按鈕選擇本地 CSV 文件
            </li>
            <li>
              <strong>下載示例：</strong>點擊「下載示例文件」獲取測試用的 CSV 文件
            </li>
            <li>
              <strong>複製貼上：</strong>點擊「複製示例 CSV」或準備自己的 CSV 數據
            </li>
            <li>
              在頁面任意位置按 <kbd className='bg-white px-1 rounded'>Ctrl+V</kbd> 貼上數據
            </li>
            <li>數據會自動解析並添加到表格中</li>
            <li>
              <strong>選擇管理：</strong>使用 checkbox 選擇行，可批量刪除選中的數據
            </li>
            <li>可以直接編輯單元格內容</li>
          </ol>
          <div className='mt-2 p-2 bg-blue-200 rounded'>
            <strong>文件要求：</strong> CSV 格式，第一行為列標題，檔案大小不超過 10MB
          </div>
        </div>

        {/* 狀態顯示 */}
        <div className='w-full flex flex-wrap items-center gap-4 mt-2'>
          <span className='px-3 py-1 bg-white rounded border text-sm'>
            總數據: <span className='font-semibold text-blue-600'>{getTotalCount()}</span> 筆
          </span>
          <span className='px-3 py-1 bg-white rounded border text-sm'>
            已選擇: <span className='font-semibold text-green-600'>{getSelectedCount()}</span> 筆
          </span>
          <span className='px-3 py-1 bg-white rounded border text-sm'>
            狀態:{' '}
            <span
              className={`font-medium ${
                isAllSelected() ? 'text-green-600' : isIndeterminate() ? 'text-orange-600' : 'text-gray-600'
              }`}
            >
              {isAllSelected() ? '全選' : isIndeterminate() ? '部分選中' : '未選擇'}
            </span>
          </span>
          {isLoading && (
            <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded border text-sm'>處理中...</span>
          )}
          {error && <span className='px-3 py-1 bg-red-100 text-red-800 rounded border text-sm'>錯誤: {error}</span>}
        </div>
      </div>

      {/* AG-Grid 表格 */}
      <div className={`ag-theme-alpine ${className}`} style={{ height }}>
        <AgGridReact
          ref={gridRef}
          rowData={allRows as CsvRow[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onSelectionChanged={handleSelectionChanged}
          animateRows={true}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          stopEditingWhenCellsLoseFocus={true}
          // 🎯 選擇設定
          rowSelection='multiple'
          suppressRowClickSelection={true}
          rowMultiSelectWithClick={false}
          suppressRowDeselection={false}
          // 🎯 無數據時的提示
          overlayNoRowsTemplate={
            '<div class="p-8 text-center text-gray-500">' +
            '<div class="text-lg font-semibold mb-2">尚無數據</div>' +
            '<div class="text-sm">請上傳 CSV 文件或複製 CSV 數據並按 Ctrl+V 貼上</div>' +
            '<div class="text-sm">或點擊「下載示例文件」開始測試</div>' +
            '</div>'
          }
        />
      </div>
    </div>
  )
})

export default CsvPasteTable
