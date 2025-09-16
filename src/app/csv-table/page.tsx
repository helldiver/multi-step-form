'use client'

import { useState, useCallback } from 'react'
import CsvPasteTable from '@/components/data-table/CsvPasteTable'
import {
  Download as DownloadIcon,
  BarChart3 as BarChartIcon,
  FileText as FileTextIcon,
  Users as UsersIcon
} from 'lucide-react'
import { CsvRow, downloadExampleCsv } from '@/utils/csvFileUtils'

// 🎯 純函數：計算統計信息
interface TableStats {
  readonly totalRows: number
  readonly totalColumns: number
  readonly lastUpdated: string
  readonly hasData: boolean
}

const calculateStats = (data: CsvRow[]): TableStats => ({
  totalRows: data.length,
  totalColumns: data.length > 0 ? Object.keys(data[0]).filter((key) => key !== 'id').length : 0,
  lastUpdated: new Date().toLocaleTimeString(),
  hasData: data.length > 0,
})

// 🎯 純函數：生成統計卡片配置
const getStatCards = (stats: TableStats) =>
  [
    {
      title: '總行數',
      value: stats.totalRows,
      color: 'text-green-600',
      icon: FileTextIcon,
      bgColor: 'bg-green-50',
    },
    {
      title: '欄位數',
      value: stats.totalColumns,
      color: 'text-blue-600',
      icon: BarChartIcon,
      bgColor: 'bg-blue-50',
    },
    {
      title: '最後更新',
      value: stats.lastUpdated,
      color: 'text-purple-600',
      icon: UsersIcon,
      bgColor: 'bg-purple-50',
      isTime: true,
    },
  ] as const

// 🎯 組件：統計卡片
interface StatCardProps {
  title: string
  value: string | number
  color: string
  bgColor: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  isTime?: boolean
}

const StatCard = ({ title, value, color, bgColor, icon: Icon, isTime = false }: StatCardProps) => (
  <div className={`${bgColor} p-3 rounded border`}>
    <div className='flex items-center justify-between mb-2'>
      <div className='text-gray-600 text-sm'>{title}</div>
      <Icon size={16} className='text-gray-400' />
    </div>
    <div className={`text-xl font-bold ${color}`}>
      {isTime ? value : typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
)

// 🎯 組件：功能介紹卡片
const FeatureCard = ({
  title,
  description,
  steps,
}: {
  title: string
  description: string
  steps: readonly string[]
}) => (
  <div className='bg-white p-4 rounded-lg border border-gray-200'>
    <h4 className='font-semibold text-gray-800 mb-2'>{title}</h4>
    <p className='text-sm text-gray-600 mb-3'>{description}</p>
    <ol className='list-decimal list-inside space-y-1 text-sm text-gray-700'>
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  </div>
)

const CsvPasteExample = () => {
  const [tableData, setTableData] = useState<CsvRow[]>([])

  // 🎯 處理數據變更
  const handleDataChange = useCallback((data: CsvRow[]) => {
    console.log('📊 表格數據已更新:', data.length, '行')
    setTableData(data)
  }, [])

  // 🎯 下載示例文件
  const handleDownloadExample = useCallback(() => {
    try {
      downloadExampleCsv()
      console.log('📁 示例文件開始下載')
    } catch (error) {
      console.error('❌ 下載失敗:', error)
    }
  }, [])

  // 🎯 計算統計信息
  const stats = calculateStats(tableData)
  const statCards = getStatCards(stats)

  // 🎯 功能介紹配置
  const features = [
    {
      title: '文件上傳',
      description: '直接上傳本地 CSV 文件，支援大型數據集處理',
      steps: ['點擊「上傳 CSV 文件」按鈕', '選擇本地 .csv 文件（最大 10MB）', '系統自動解析並填入表格'],
    },
    {
      title: '複製貼上',
      description: '快速貼上 CSV 格式的文本數據',
      steps: ['準備 CSV 格式數據或點擊「複製示例 CSV」', '在頁面任意位置按 Ctrl+V', '數據自動解析並添加到表格'],
    },
    {
      title: '數據編輯',
      description: '直接在表格中編輯和管理數據',
      steps: ['點擊任意單元格開始編輯', '使用每行的刪除按鈕移除數據', '修改會即時保存'],
    },
  ] as const

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-2'>CSV 文件處理表格</h1>
      <p className='text-gray-600 mb-6'>支援文件上傳、複製貼上、即時編輯的多功能數據表格</p>

      {/* 快速開始區域 */}
      <div className='mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg'>
        <h3 className='font-semibold text-yellow-800 mb-3 flex items-center gap-2'>
          <DownloadIcon size={20} />
          快速開始測試
        </h3>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handleDownloadExample}
            className='flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium'
          >
            <DownloadIcon size={16} />
            下載示例 CSV 文件
          </button>
          <div className='text-sm text-yellow-700 flex items-center'>
            下載包含員工數據的示例文件，然後上傳到表格中進行測試
          </div>
        </div>
      </div>

      {/* 功能介紹 */}
      <div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {/* 主要表格組件 */}
      <CsvPasteTable height='600px' onDataChange={handleDataChange} className='shadow-lg rounded-lg overflow-hidden' />

      {/* 數據統計 */}
      {stats.hasData && (
        <div className='mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200'>
          <h3 className='text-lg font-semibold text-green-800 mb-4 flex items-center gap-2'>
            <BarChartIcon size={20} />
            數據統計概覽
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {statCards.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        </div>
      )}

      {/* 詳細說明 */}
      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3'>支援的 CSV 格式說明</h3>
        <div className='bg-white p-4 rounded border font-mono text-sm overflow-x-auto mb-4'>
          <pre className='text-gray-700'>{`name,email,age,department,salary,joinDate
John Doe,john@example.com,30,Engineering,75000,2022-01-15
Jane Smith,jane@example.com,25,Design,65000,2022-03-20
Bob Johnson,bob@example.com,35,Marketing,70000,2021-11-10`}</pre>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-semibold text-gray-700 mb-2'>✅ 格式要求</h4>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• 第一行必須是列標題</li>
              <li>• 使用逗號分隔數據欄位</li>
              <li>• 支援中文和特殊字元</li>
              <li>• 數字會自動識別轉換</li>
              <li>• 文件大小限制 10MB</li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-gray-700 mb-2'>🚀 功能特色</h4>
            <ul className='text-sm text-gray-600 space-y-1'>
              <li>• 自動數據類型識別</li>
              <li>• 即時編輯表格內容</li>
              <li>• 支援大量數據處理</li>
              <li>• 可匯出處理後的數據</li>
              <li>• 響應式設計支援移動設備</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CsvPasteExample
