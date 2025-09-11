'use client';

import { useEffect } from 'react';
import { DataTable } from './DataTable';
import { DataTableToolbar } from './DataTableToolbar';
import { useDataTableStore } from '@/store/dataTable';

export const DataTablePage: React.FC = () => {
  const { fetchData, isLoading, error, data } = useDataTableStore();
  
  useEffect(() => {
    if (data.length === 0) {
      fetchData();
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">資料表格</h1>
          <p className="mt-2 text-gray-600">
            使用 AG-Grid 建立的資料表格，支援多選、排序、篩選等功能
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="text-red-400">⚠</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">發生錯誤</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex">
            {/* 主要內容區域 */}
            <div className="flex-1">
              <DataTable height="600px" />
            </div>
            
            {/* 右側工具列 */}
            <DataTableToolbar />
          </div>
        </div>
        
        {/* 統計資訊 */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">總計資料</div>
            <div className="text-2xl font-bold text-gray-900">{data.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">已選擇</div>
            <div className="text-2xl font-bold text-blue-600">
              {useDataTableStore.getState().selectedRows.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">狀態</div>
            <div className="text-lg font-medium text-green-600">
              {isLoading ? '載入中...' : '已載入'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
