import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useMultiStepFormStore } from '@/store/multiStepForm'
import { useFormSync } from '@/hooks/useFormSync'

// 根據用戶類型創建不同的驗證 schema
const createStep2Schema = (userType: string) => {
  const baseSchema = z.object({
    contactEmail: z.email('請輸入有效的電子郵件'),
    phone: z.string().min(1, '請輸入電話號碼'),
    preferences: z.array(z.string()).min(1, '請至少選擇一個偏好'),
  })

  switch (userType) {
    case 'individual':
      return baseSchema.extend({
        personalInfo: z.object({
          firstName: z.string().min(1, '請輸入名字'),
          lastName: z.string().min(1, '請輸入姓氏'),
          dateOfBirth: z.string().min(1, '請選擇出生日期'),
          income: z.number().min(0, '收入不能為負數'),
        }),
      })

    case 'business':
      return baseSchema.extend({
        businessInfo: z.object({
          companyName: z.string().min(1, '請輸入公司名稱'),
          industry: z.string().min(1, '請選擇行業'),
          employees: z.number().min(1, '員工數必須大於 0'),
          revenue: z.number().min(0, '營收不能為負數'),
        }),
      })

    case 'enterprise':
      return baseSchema.extend({
        enterpriseInfo: z.object({
          organizationName: z.string().min(1, '請輸入組織名稱'),
          departments: z.array(z.string()).min(1, '請至少選擇一個部門'),
          budget: z.number().min(0, '預算不能為負數'),
          timeline: z.string().min(1, '請選擇時間線'),
        }),
      })

    default:
      return baseSchema
  }
}

export const Step2: React.FC = () => {
  const { formData, setStepValid, setStepCompleted } = useMultiStepFormStore()

  const userType = formData.step1?.userType
  const schema = createStep2Schema(userType || '')

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: formData.step2 || {},
    mode: 'onChange',
  })

  const watchedValues = watch()

  useFormSync({
    stepKey: 'step2',
    stepId: 2,
    formData: watchedValues,
    isValid,
  })

  useEffect(() => {
    setStepValid(2, isValid)
    if (isValid) {
      setStepCompleted(2, true)
    }
  }, [isValid, setStepValid, setStepCompleted])

  const renderUserTypeSpecificFields = () => {
    switch (userType) {
      case 'individual':
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>個人資訊</h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>名字</label>
                <input
                  type='text'
                  {...register('personalInfo.firstName')}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.personalInfo?.firstName && (
                  <p className='text-red-500 text-sm mt-1'>{errors.personalInfo.firstName.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>姓氏</label>
                <input
                  type='text'
                  {...register('personalInfo.lastName')}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.personalInfo?.lastName && (
                  <p className='text-red-500 text-sm mt-1'>{errors.personalInfo.lastName.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>出生日期</label>
                <input
                  type='date'
                  {...register('personalInfo.dateOfBirth')}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.personalInfo?.dateOfBirth && (
                  <p className='text-red-500 text-sm mt-1'>{errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>年收入</label>
                <input
                  type='number'
                  {...register('personalInfo.income', { valueAsNumber: true })}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.personalInfo?.income && (
                  <p className='text-red-500 text-sm mt-1'>{errors.personalInfo.income.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>企業資訊</h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>公司名稱</label>
                <input
                  type='text'
                  {...register('businessInfo.companyName')}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.businessInfo?.companyName && (
                  <p className='text-red-500 text-sm mt-1'>{errors.businessInfo.companyName.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>行業</label>
                <select {...register('businessInfo.industry')} className='w-full p-2 border border-gray-300 rounded-md'>
                  <option value=''>請選擇行業</option>
                  <option value='technology'>科技業</option>
                  <option value='finance'>金融業</option>
                  <option value='manufacturing'>製造業</option>
                  <option value='retail'>零售業</option>
                </select>
                {errors.businessInfo?.industry && (
                  <p className='text-red-500 text-sm mt-1'>{errors.businessInfo.industry.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>員工數</label>
                <input
                  type='number'
                  {...register('businessInfo.employees', { valueAsNumber: true })}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.businessInfo?.employees && (
                  <p className='text-red-500 text-sm mt-1'>{errors.businessInfo.employees.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>年營收</label>
                <input
                  type='number'
                  {...register('businessInfo.revenue', { valueAsNumber: true })}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.businessInfo?.revenue && (
                  <p className='text-red-500 text-sm mt-1'>{errors.businessInfo.revenue.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'enterprise':
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>組織資訊</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>組織名稱</label>
                <input
                  type='text'
                  {...register('enterpriseInfo.organizationName')}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
                {errors.enterpriseInfo?.organizationName && (
                  <p className='text-red-500 text-sm mt-1'>{errors.enterpriseInfo.organizationName.message}</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>相關部門</label>
                <div className='grid md:grid-cols-3 gap-2'>
                  {['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal'].map((dept) => (
                    <label key={dept} className='flex items-center'>
                      <input
                        type='checkbox'
                        value={dept}
                        {...register('enterpriseInfo.departments')}
                        className='mr-2'
                      />
                      {dept}
                    </label>
                  ))}
                </div>
                {errors.enterpriseInfo?.departments && (
                  <p className='text-red-500 text-sm mt-1'>{errors.enterpriseInfo.departments.message}</p>
                )}
              </div>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>預算</label>
                  <input
                    type='number'
                    {...register('enterpriseInfo.budget', { valueAsNumber: true })}
                    className='w-full p-2 border border-gray-300 rounded-md'
                  />
                  {errors.enterpriseInfo?.budget && (
                    <p className='text-red-500 text-sm mt-1'>{errors.enterpriseInfo.budget.message}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>時間線</label>
                  <select
                    {...register('enterpriseInfo.timeline')}
                    className='w-full p-2 border border-gray-300 rounded-md'
                  >
                    <option value=''>請選擇時間線</option>
                    <option value='immediate'>立即</option>
                    <option value='1-3months'>1-3 個月</option>
                    <option value='3-6months'>3-6 個月</option>
                    <option value='6months+'>6 個月以上</option>
                  </select>
                  {errors.enterpriseInfo?.timeline && (
                    <p className='text-red-500 text-sm mt-1'>{errors.enterpriseInfo.timeline.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>詳細設定</h2>
        <p className='text-gray-600'>請填寫詳細的資訊</p>
      </div>

      {/* 用戶類型特定欄位 */}
      {renderUserTypeSpecificFields()}

      {/* 共用欄位 */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>聯絡資訊</h3>
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>聯絡信箱</label>
            <input
              type='email'
              {...register('contactEmail')}
              className='w-full p-2 border border-gray-300 rounded-md'
            />
            {errors.contactEmail && <p className='text-red-500 text-sm mt-1'>{errors.contactEmail.message}</p>}
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>電話號碼</label>
            <input type='tel' {...register('phone')} className='w-full p-2 border border-gray-300 rounded-md' />
            {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium mb-2'>偏好設定</label>
          <div className='grid md:grid-cols-2 gap-2'>
            {['電子郵件通知', '簡訊通知', '電話聯絡', '定期報告', '即時更新', '週報'].map((pref) => (
              <label key={pref} className='flex items-center'>
                <input type='checkbox' value={pref} {...register('preferences')} className='mr-2' />
                {pref}
              </label>
            ))}
          </div>
          {errors.preferences && <p className='text-red-500 text-sm mt-1'>{errors.preferences.message}</p>}
        </div>
      </div>
    </div>
  )
}
