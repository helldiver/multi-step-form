import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useFormSync } from '@/hooks/useFormSync'
import { useMultiStepFormStore } from '@/stores/multiStepForm'

const step3Schema = z.object({
  features: z.array(z.string()).min(1, '請至少選擇一個功能'),
  customRequirements: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, '請同意服務條款'),
  marketingConsent: z.boolean(),
  additionalServices: z.array(z.string()).optional(),
  supportLevel: z.enum(['basic', 'premium', 'enterprise']).optional(),
})

type Step3FormData = z.infer<typeof step3Schema>

export const Step3: React.FC = () => {
  const { formData, setStepValid, setStepCompleted } = useMultiStepFormStore()

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.step3 || {},
    mode: 'onChange',
  })

  const watchedValues = watch()
  const userType = formData.step1?.userType
  const priority = formData.step1?.priority

  useFormSync({
    stepKey: 'step3',
    stepId: 3,
    formData: watchedValues,
    isValid,
  })

  useEffect(() => {
    setStepValid(3, isValid)
    if (isValid) {
      setStepCompleted(3, true)
    }
  }, [isValid, setStepValid, setStepCompleted])

  // 根據前面的選擇決定顯示的功能選項
  const getFeatureOptions = () => {
    const baseFeatures = ['基礎分析', '報告生成', '資料匯出']

    if (userType === 'enterprise') {
      return [...baseFeatures, '進階分析', 'API 整合', '客製化儀表板', '多用戶管理']
    } else if (userType === 'business') {
      return [...baseFeatures, '進階分析', '團隊協作', '資料同步']
    } else {
      return [...baseFeatures, '個人儀表板', '移動應用']
    }
  }

  // 根據用戶類型顯示對應的附加服務
  const getAdditionalServices = () => {
    switch (userType) {
      case 'enterprise':
        return ['專屬客戶經理', '24/7 技術支援', '現場培訓', '客製化開發']
      case 'business':
        return ['優先技術支援', '線上培訓', '定期健檢']
      case 'individual':
        return ['線上諮詢', '學習資源', '社群支援']
      default:
        return []
    }
  }

  // 根據優先級和用戶類型決定是否顯示支援等級選項
  const shouldShowSupportLevel = () => {
    return userType === 'enterprise' || (userType === 'business' && priority === 'high')
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>進階選項</h2>
        <p className='text-gray-600'>選擇功能和服務選項</p>
      </div>

      {/* 功能選擇 */}
      <div>
        <label className='block text-sm font-medium mb-3'>功能選擇</label>
        <div className='grid md:grid-cols-2 gap-3'>
          {getFeatureOptions().map((feature) => (
            <label key={feature} className='flex items-center p-3 border rounded-lg hover:bg-gray-50'>
              <input type='checkbox' value={feature} {...register('features')} className='mr-3' />
              <span>{feature}</span>
            </label>
          ))}
        </div>
        {errors.features && <p className='text-red-500 text-sm mt-1'>{errors.features.message}</p>}
      </div>

      {/* 附加服務 (條件性顯示) */}
      {getAdditionalServices().length > 0 && (
        <div>
          <label className='block text-sm font-medium mb-3'>附加服務</label>
          <div className='grid md:grid-cols-2 gap-3'>
            {getAdditionalServices().map((service) => (
              <label key={service} className='flex items-center p-3 border rounded-lg hover:bg-gray-50'>
                <input type='checkbox' value={service} {...register('additionalServices')} className='mr-3' />
                <span>{service}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 支援等級 (條件性顯示) */}
      {shouldShowSupportLevel() && (
        <div>
          <label className='block text-sm font-medium mb-3'>支援等級</label>
          <div className='space-y-3'>
            {[
              { value: 'basic', label: '基礎支援', desc: '工作日 9-17 點支援' },
              { value: 'premium', label: '優質支援', desc: '工作日 24 小時支援' },
              { value: 'enterprise', label: '企業支援', desc: '24/7 全天候支援' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  watchedValues.supportLevel === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type='radio' value={option.value} {...register('supportLevel')} className='mt-1 mr-3' />
                <div>
                  <div className='font-medium'>{option.label}</div>
                  <div className='text-sm text-gray-500'>{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 客製化需求 */}
      <div>
        <label className='block text-sm font-medium mb-2'>客製化需求</label>
        <textarea
          {...register('customRequirements')}
          rows={4}
          className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='請描述您的特殊需求或期望...'
        />
      </div>

      {/* 條款同意 */}
      <div className='space-y-3'>
        <label className='flex items-start'>
          <input type='checkbox' {...register('agreedToTerms')} className='mt-1 mr-3' />
          <span className='text-sm'>
            我已閱讀並同意
            <a href='/terms' className='text-blue-500 hover:underline' target='_blank'>
              服務條款
            </a>
            和
            <a href='/privacy' className='text-blue-500 hover:underline' target='_blank'>
              隱私政策
            </a>
          </span>
        </label>
        {errors.agreedToTerms && <p className='text-red-500 text-sm'>{errors.agreedToTerms.message}</p>}

        <label className='flex items-start'>
          <input type='checkbox' {...register('marketingConsent')} className='mt-1 mr-3' />
          <span className='text-sm'>我同意接收產品更新和行銷訊息 (可隨時取消訂閱)</span>
        </label>
      </div>
    </div>
  )
}
