'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, SelectionChangedEvent } from 'ag-grid-community'
import type { IRowNode } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

interface Person {
  id: number
  name: string
  phone: string
}

interface GridParams {
  data: Person
}

const TwoTable = () => {
  // 左邊表格的所有資料
  const [leftTableData] = useState<Person[]>([
    { id: 123, name: 'Amber', phone: '0912345678' },
    { id: 124, name: 'Bob', phone: '0923456789' },
    { id: 125, name: 'Charlie', phone: '0934567890' },
    { id: 126, name: 'Diana', phone: '0945678901' },
    { id: 127, name: 'Eric', phone: '0956789012' },
  ])

  // 已選取的資料 ID 集合
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Grid API 參考
  const leftGridRef = useRef<AgGridReact>(null)
  const rightGridRef = useRef<AgGridReact>(null)

  // 根據選取的 ID 計算右邊表格的資料
  const rightTableData = leftTableData.filter((item) => selectedIds.has(item.id))

  // 表格欄位定義
  const leftColumnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left'
    },
    { headerName: 'ID', field: 'id' },
    { headerName: '姓名', field: 'name' },
    { headerName: '電話', field: 'phone' },
  ]

  const rightColumnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      width: 50,
      pinned: 'left',
    },
    { headerName: 'ID', field: 'id', width: 100 },
    { headerName: '姓名', field: 'name', width: 120 },
    { headerName: '電話', field: 'phone', width: 140 },
  ]

  // 左邊表格選取變更處理
  const onLeftSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes()
    const newSelectedIds = new Set(selectedNodes.map((node) => node.data.id))
    setSelectedIds(newSelectedIds)
  }, [])

  // 右邊表格選取變更處理
  const onRightSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes()
    const rightSelectedIds = new Set(selectedNodes.map((node) => node.data.id))

    // 更新整體選取狀態（只保留右邊仍被選取的項目）
    setSelectedIds(rightSelectedIds)
  }, [])

  // 當選取狀態改變時，同步左邊表格的選取狀態
  useEffect(() => {
    if (leftGridRef.current?.api) {
      leftGridRef.current.api.forEachNode((node: IRowNode<Person>) => {
        const shouldBeSelected: boolean = selectedIds.has(node.data!.id)
        if (node.isSelected() !== shouldBeSelected) {
          node.setSelected(shouldBeSelected, false)
        }
      })
    }
  }, [selectedIds])

  // 當右邊表格資料變更時，設定所有項目為選取狀態
  const onRightGridReady = useCallback(() => {
    if (rightGridRef.current?.api) {
      rightGridRef.current.api.selectAll()
    }
  }, [])

  // 當右邊表格資料更新後，重新選取所有項目
  useEffect(() => {
    if (rightGridRef.current?.api) {
      rightGridRef.current.api.selectAll()
    }
  }, [rightTableData.length])

    return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>雙表格同步選取</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* 左邊表格 */}
        <div>
          <h2 className='text-xl font-semibold mb-3'>來源資料表格</h2>
          <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
            <AgGridReact<Person>
              ref={leftGridRef}
              rowData={leftTableData}
              columnDefs={leftColumnDefs}
              rowSelection='multiple'
              suppressRowClickSelection={true}
              onSelectionChanged={onLeftSelectionChanged}
              getRowId={(params: GridParams) => params.data.id.toString()}
            />
          </div>
        </div>

      {/* 右邊表格 */}
        <div>
          <h2 className='text-xl font-semibold mb-3'>已選取資料表格 ({rightTableData.length})</h2>
          <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
            <AgGridReact<Person>
              ref={rightGridRef}
              rowData={rightTableData}
              columnDefs={rightColumnDefs}
              rowSelection='multiple'
              suppressRowClickSelection={true}
              onSelectionChanged={onRightSelectionChanged}
              onGridReady={onRightGridReady}
              getRowId={(params: GridParams) => params.data.id.toString()}
            />
          </div>
        </div>
      </div>

      {/* 說明文字 */}
      <div className='mt-6 p-4 text-gray-700 bg-gray-100 rounded-lg'>
        <h3 className='font-semibold mb-2'>使用說明：</h3>
        <ul className='space-y-1 text-sm'>
          <li>• 在左邊表格選取資料，會同步顯示到右邊表格並呈現選取狀態</li>
          <li>• 在右邊表格取消選取，該筆資料會從右邊表格移除，左邊也會取消選取</li>
          <li>• 兩個表格的選取狀態會保持同步</li>
        </ul>
      </div>

      {/* 調試資訊 */}
      <div className='mt-4 p-3 text-gray-700 bg-blue-50 rounded text-sm'>
        <strong>目前選取的 ID:</strong> [{Array.from(selectedIds).join(', ')}]
      </div>
    </div>
  )
}

export default TwoTable
