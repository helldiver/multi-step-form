import { useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { useDataTableStore } from '@/store/dataTable'
import { CreateRowModal } from './CreateRowModal'

export const DataTableToolbar: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { selectedRows, hasSelectedRows, deleteSelectedRows, fetchData, isLoading } = useDataTableStore()

  const handleDelete = async () => {
    if (!hasSelectedRows()) return

    const confirmed = window.confirm(`確定要刪除選中的 ${selectedRows.length} 筆資料嗎？此操作無法復原。`)

    if (confirmed) {
      await deleteSelectedRows()
    }
  }

  const handleRefresh = async () => {
    await fetchData()
  }

  return (
    <>
      <div className='flex flex-col space-y-3 p-4 bg-white border-l border-gray-200 min-w-[200px]'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>操作工具</h3>

        {/* 新增按鈕 */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isLoading}
          className='flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <Plus size={16} />
          <span>新增資料</span>
        </button>

        {/* 刪除按鈕 */}
        <button
          onClick={handleDelete}
          disabled={!hasSelectedRows() || isLoading}
          className='flex items-center justify-center space-x-2 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <Trash2 size={16} />
          <span>刪除選中 {hasSelectedRows() && `(${selectedRows.length})`}</span>
        </button>

        {/* 重新整理按鈕 */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className='flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>重新整理</span>
        </button>

        {/* 選擇狀態顯示 */}
        <div className='mt-4 p-3 bg-gray-50 rounded-md'>
          <div className='text-sm text-gray-600'>
            <div>已選擇: {selectedRows.length} 筆</div>
            <div className='mt-1'>
              {hasSelectedRows() && (
                <button
                  onClick={() => useDataTableStore.getState().deselectAll()}
                  className='text-blue-500 hover:underline text-xs'
                >
                  清除選擇
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>快速操作</h4>
          <div className='space-y-2'>
            <button
              onClick={() => useDataTableStore.getState().selectAll()}
              disabled={isLoading}
              className='w-full text-left text-sm text-blue-500 hover:underline disabled:opacity-50'
            >
              全選
            </button>
            <button
              onClick={() => useDataTableStore.getState().deselectAll()}
              disabled={isLoading}
              className='w-full text-left text-sm text-blue-500 hover:underline disabled:opacity-50'
            >
              取消全選
            </button>
          </div>
        </div>
      </div>

      {/* 新增資料模態框 */}
      <CreateRowModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  )
}
