import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useMultiStepFormStore } from '@/store/multiStepForm'
import { useFormSync } from '@/hooks/useFormSync'
import { USER_TYPE_OPTIONS, REGION_OPTIONS } from '@/constants/form'

const step1Schema = z.object({
  userType: z.enum(['individual', 'business', 'enterprise']),
  region: z.enum(['asia', 'europe', 'americas']),
  category: z.string().min(1, '請選擇類別'),
  priority: z.enum(['low', 'medium', 'high']),
})

type Step1FormData = z.infer<typeof step1Schema>

export const Step1: React.FC = () => {
  const { formData, setStepValid, setStepCompleted } = useMultiStepFormStore()

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData.step1 || {},
    mode: 'onChange',
  })

  const watchedValues = watch()

  // 監聽表單變化，即時更新 Zustand store
  // useEffect(() => {
  //   updateFormData('step1', watchedValues)
  // }, [watchedValues, updateFormData])
  useFormSync({
    stepKey: 'step1',
    stepId: 1,
    formData: watchedValues,
    isValid,
  })

  // 監聽驗證狀態
  useEffect(() => {
    setStepValid(1, isValid)
    if (isValid) {
      setStepCompleted(1, true)
    }
  }, [isValid, setStepValid, setStepCompleted])

  const userType = watch('userType')

  // 根據用戶類型顯示不同的類別選項
  const getCategoryOptions = () => {
    switch (userType) {
      case 'individual':
        return ['個人理財', '投資管理', '保險規劃']
      case 'business':
        return ['企業貸款', '商業保險', '財務管理']
      case 'enterprise':
        return ['企業併購', '風險管理', '資產配置']
      default:
        return []
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>基本資訊</h2>
        <p className='text-gray-600'>請選擇您的用戶類型和基本需求</p>
      </div>

      {/* 用戶類型選擇 */}
      <div>
        <label className='block text-sm font-medium mb-3'>用戶類型</label>
        <div className='grid md:grid-cols-3 gap-4'>
          {USER_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                watchedValues.userType === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input type='radio' value={option.value} {...register('userType')} className='sr-only' />
              <div className='font-medium'>{option.label}</div>
              <div className='text-sm text-gray-500'>{option.description}</div>
            </label>
          ))}
        </div>
        {errors.userType && <p className='text-red-500 text-sm mt-1'>{errors.userType.message}</p>}
      </div>

      {/* 地區選擇 */}
      <div>
        <label className='block text-sm font-medium mb-2'>服務地區</label>
        <select
          {...register('region')}
          className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>請選擇地區</option>
          {REGION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.region && <p className='text-red-500 text-sm mt-1'>{errors.region.message}</p>}
      </div>

      {/* 類別選擇 (根據用戶類型動態變化) */}
      {userType && (
        <div>
          <label className='block text-sm font-medium mb-2'>服務類別</label>
          <select
            {...register('category')}
            className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>請選擇類別</option>
            {getCategoryOptions().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className='text-red-500 text-sm mt-1'>{errors.category.message}</p>}
        </div>
      )}

      {/* 優先級 */}
      <div>
        <label className='block text-sm font-medium mb-2'>優先級</label>
        <div className='flex space-x-4'>
          {[
            { value: 'low', label: '低' },
            { value: 'medium', label: '中' },
            { value: 'high', label: '高' },
          ].map((option) => (
            <label key={option.value} className='flex items-center'>
              <input type='radio' value={option.value} {...register('priority')} className='mr-2' />
              {option.label}
            </label>
          ))}
        </div>
        {errors.priority && <p className='text-red-500 text-sm mt-1'>{errors.priority.message}</p>}
      </div>
    </div>
  )
}
