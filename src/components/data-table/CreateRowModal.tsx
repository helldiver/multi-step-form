import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useDataTableStore } from '@/stores/dataTableStore'
import { CreateRowData } from '@/types/dataTable'

const createRowSchema = z.object({
  title1: z.string().min(1, 'Title 1 為必填'),
  title2: z.string().min(1, 'Title 2 為必填'),
  status: z.enum(['active', 'inactive', 'pending']),
  category: z.string().min(1, '類別為必填'),
  value: z.number().min(0, '數值不能為負數'),
})

interface CreateRowModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateRowModal: React.FC<CreateRowModalProps> = ({ isOpen, onClose }) => {
  const { createRow, isLoading } = useDataTableStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateRowData>({
    resolver: zodResolver(createRowSchema),
    defaultValues: {
      status: 'active',
      value: 0,
    },
  })

  const onSubmit = async (data: CreateRowData) => {
    await createRow(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>新增資料</h2>
          <button onClick={handleClose} className='text-gray-400 hover:text-gray-600'>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Title 1</label>
            <input
              type='text'
              {...register('title1')}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='請輸入 Title 1'
            />
            {errors.title1 && <p className='text-red-500 text-sm mt-1'>{errors.title1.message}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Title 2</label>
            <input
              type='text'
              {...register('title2')}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='請輸入 Title 2'
            />
            {errors.title2 && <p className='text-red-500 text-sm mt-1'>{errors.title2.message}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>狀態</label>
            <select
              {...register('status')}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='active'>啟用</option>
              <option value='inactive'>停用</option>
              <option value='pending'>待處理</option>
            </select>
            {errors.status && <p className='text-red-500 text-sm mt-1'>{errors.status.message}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>類別</label>
            <select
              {...register('category')}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>請選擇類別</option>
              <option value='類別 1'>類別 1</option>
              <option value='類別 2'>類別 2</option>
              <option value='類別 3'>類別 3</option>
            </select>
            {errors.category && <p className='text-red-500 text-sm mt-1'>{errors.category.message}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>數值</label>
            <input
              type='number'
              {...register('value', { valueAsNumber: true })}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='請輸入數值'
              min='0'
              step='1'
            />
            {errors.value && <p className='text-red-500 text-sm mt-1'>{errors.value.message}</p>}
          </div>

          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
            >
              取消
            </button>
            <button
              type='submit'
              disabled={!isValid || isLoading}
              className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? '新增中...' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
