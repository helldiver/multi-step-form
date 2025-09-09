'use client'

import { MultiStepForm } from '@/components/forms/MultiStepForm'
import { useEffect } from 'react'
import { useMultiStepFormStore } from '@/store/multiStepForm'

export default function FormPage() {
  const resetForm = useMultiStepFormStore((state) => state.resetForm)

  // 頁面載入時可以選擇是否重設表單
  useEffect(() => {
    // 如果需要每次進入都重新開始，取消註解下面這行
    resetForm();
  }, [resetForm])

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>多步驟查詢表單</h1>
          <p className='mt-2 text-gray-600'>請按照步驟填寫資訊，最後點擊 Query 查詢相關資料</p>
        </div>

        <MultiStepForm />
      </div>
    </div>
  )
}
