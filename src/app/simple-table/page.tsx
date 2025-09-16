'use client'

import { useCallback, useRef } from 'react'
import { ColDef } from 'ag-grid-community'
import SimpleTable from '@/components/data-table/SimpleTable'
import TableControls from '@/components/data-table/SimpleTableControls'
import { useTableStore } from '@/stores/simpleTableStore'
import type { DataTableRef } from '@/components/data-table/SimpleTable'

interface ExampleData extends Record<string, unknown> {
  id: number
  name: string
  email: string
  age: number
  department: string
}

// Import ag-Grid styles
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const SimpleTablePage = () => {
  const tableRef = useRef<DataTableRef>(null)

  // 範例資料
  const sampleData: ExampleData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, department: 'Design' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Marketing' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, department: 'Engineering' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', age: 32, department: 'Sales' },
    { id: 6, name: 'Eva Wilson', email: 'eva@example.com', age: 29, department: 'Design' },
  ]

  // 定義欄位
  const columns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: '姓名', minWidth: 120 },
    { field: 'email', headerName: '電子郵件', minWidth: 200 },
    { field: 'age', headerName: '年齡', width: 100 },
    { field: 'department', headerName: '部門', minWidth: 120 },
  ]

  // !important：🔧 使用 useTableStore selector 避免不必要的重渲染
  const selectedRows = useTableStore((state) => state.selectedRows)

  // 🔧 修正：處理選擇變更的回調
  const handleSelectionChange = useCallback((rows: Record<string, unknown>[]) => {
    console.log('✅ 選擇變更回調被觸發:', rows.length, '筆資料')
    console.log('📋 選中的資料詳情:', rows)
  }, [])

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>員工資料表格 (修正版 Zustand 狀態管理)</h1>

      {/* 控制按鈕 */}
      <TableControls tableRef={tableRef} />

      {/* 表格 */}
      <div className='mt-6'>
        <SimpleTable
          ref={tableRef}
          data={sampleData}
          columns={columns}
          height='500px'
          className='shadow-lg rounded-lg overflow-hidden'
          idField='id'
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* 顯示選中資料的區域 */}
      <div className='mt-6 p-4 bg-blue-50 text-gray-700 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>選中的資料 (來自 Zustand Store)：</h3>
        {selectedRows.length > 0 ? (
          <div>
            <p className='text-sm text-gray-600 mb-2'>共選中 {selectedRows.length} 筆資料：</p>
            <ul className='space-y-1'>
              {(selectedRows as ExampleData[]).map((row) => (
                <li key={row.id} className='text-sm bg-white p-2 rounded border'>
                  <strong>ID: {row.id}</strong> - {row.name} ({row.email}) - {row.department}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className='text-gray-500'>沒有選中任何資料</p>
        )}
      </div>
    </div>
  )
}

export default SimpleTablePage
