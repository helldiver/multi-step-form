'use client'

import { useEffect, useCallback, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  ColDef,
  GridOptions,
  SelectionChangedEvent
} from 'ag-grid-community'
import { useDataTableStore } from '@/stores/dataTableStore'
import { TableRowData } from '@/types/dataTable'

// AG-Grid CSS
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

interface DataTableProps {
  height?: string
  className?: string
}

export const DataTable: React.FC<DataTableProps> = ({ height = '500px', className = '' }) => {
  const gridRef = useRef<AgGridReact>(null)
  const { data, selectedRows, isLoading, setSelectedRows } = useDataTableStore()

  // 列定義
  const columnDefs: ColDef<TableRowData>[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'id',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        suppressMovable: true,
        suppressResize: true,
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Title 1',
        field: 'title1',
        sortable: true,
        filter: true,
        editable: true,
        width: 200,
      },
      {
        headerName: 'Title 2',
        field: 'title2',
        sortable: true,
        filter: true,
        editable: true,
        width: 200,
      },
      {
        headerName: '狀態',
        field: 'status',
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params: { value: keyof typeof statusColors }) => {
          const statusColors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
          }

          const statusLabels = {
            active: '啟用',
            inactive: '停用',
            pending: '待處理',
          }

          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[params.value]}`}>
              {statusLabels[params.value]}
            </span>
          )
        },
      },
      {
        headerName: '類別',
        field: 'category',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: '數值',
        field: 'value',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
        cellRenderer: (params: { value: number }) => {
          return params.value?.toLocaleString()
        },
      },
      {
        headerName: '建立時間',
        field: 'createdAt',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 150,
        cellRenderer: (params: { value: string }) => {
          return new Date(params.value).toLocaleDateString('zh-TW')
        },
      },
      {
        headerName: '更新時間',
        field: 'updatedAt',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 150,
        cellRenderer: (params: { value: string }) => {
          return new Date(params.value).toLocaleDateString('zh-TW')
        },
      },
    ],
    []
  )

  // Grid 選項
  const gridOptions: GridOptions = useMemo(
    () => ({
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      enableRangeSelection: true,
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: [10, 20, 50, 100],
      defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
      },
      suppressCellFocus: true,
      rowHeight: 50,
      headerHeight: 50,
      animateRows: true,
      enableCellTextSelection: true,
      loadingOverlayComponent: () => (
        <div className='flex items-center justify-center h-full'>
          <div className='text-gray-500'>載入中...</div>
        </div>
      ),
      noRowsOverlayComponent: () => (
        <div className='flex items-center justify-center h-full'>
          <div className='text-gray-500'>暫無資料</div>
        </div>
      ),
    }),
    []
  )

  // 處理選擇變化
  const onSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selectedNodes = event.api.getSelectedNodes()
      const selectedIds = selectedNodes.map((node) => node.data?.id).filter(Boolean)
      setSelectedRows(selectedIds)
    },
    [setSelectedRows]
  )

  // 同步選擇狀態
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.forEachNode((node: {
        data: { id: string | number } | undefined;
        setSelected: (selected: boolean, clearSelection: boolean) => void;
      }) => {
        if (node.data && selectedRows.includes(String(node.data.id))) {
          node.setSelected(true, false)
        } else {
          node.setSelected(false, false)
        }
      })
    }
  }, [selectedRows, data])

  // Grid 就緒事件
  const onGridReady = useCallback(() => {
    // Grid 初始化完成後的操作
    console.log('AG-Grid 初始化完成')
  }, [])

  return (
    <div className={`ag-theme-quartz ${className}`} style={{ height, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={data}
        columnDefs={columnDefs}
        gridOptions={gridOptions}
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
        // loading={isLoading}
        suppressLoadingOverlay={!isLoading}
      />
    </div>
  )
}
