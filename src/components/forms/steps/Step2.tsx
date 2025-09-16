/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { useMultiStepFormStore } from '@/stores/multiStepForm'
import { useFormSync } from '@/hooks/useFormSync'

// 🎯 定義各種表單 schema
const baseSchema = z.object({
  contactEmail: z.string().email('請輸入有效的電子郵件'),
  phone: z.string().min(1, '請輸入電話號碼'),
  preferences: z.array(z.string()).min(1, '請至少選擇一個偏好'),
})

const individualSchema = baseSchema.extend({
  personalInfo: z.object({
    firstName: z.string().min(1, '請輸入名字'),
    lastName: z.string().min(1, '請輸入姓氏'),
    dateOfBirth: z.string().min(1, '請選擇出生日期'),
    income: z.number().min(0, '收入不能為負數'),
  }),
})

const businessSchema = baseSchema.extend({
  businessInfo: z.object({
    companyName: z.string().min(1, '請輸入公司名稱'),
    industry: z.string().min(1, '請選擇行業'),
    employees: z.number().min(1, '員工數必須大於 0'),
    revenue: z.number().min(0, '營收不能為負數'),
  }),
})

const enterpriseSchema = baseSchema.extend({
  enterpriseInfo: z.object({
    organizationName: z.string().min(1, '請輸入組織名稱'),
    departments: z.array(z.string()).min(1, '請至少選擇一個部門'),
    budget: z.number().min(0, '預算不能為負數'),
    timeline: z.string().min(1, '請選擇時間線'),
  }),
})

// 🎯 推斷型別
// type BaseFormData = z.infer<typeof baseSchema>
// type IndividualFormData = z.infer<typeof individualSchema>
// type BusinessFormData = z.infer<typeof businessSchema>
// type EnterpriseFormData = z.infer<typeof enterpriseSchema>

// 🎯 聯合型別
// type Step2FormData = IndividualFormData | BusinessFormData | EnterpriseFormData

// 🎯 根據用戶類型選擇 schema
const getSchemaByUserType = (userType: string) => {
  switch (userType) {
    case 'individual':
      return individualSchema
    case 'business':
      return businessSchema
    case 'enterprise':
      return enterpriseSchema
    default:
      return baseSchema
  }
}

// 🎯 安全的錯誤訊息提取工具
interface ErrorMessageProps {
  errors: FieldErrors<any>
  name: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errors, name }) => {
  // 遞歸獲取嵌套錯誤
  const getErrorMessage = (obj: any, path: string): string | undefined => {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current?.[key]) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current?.message
  }

  const message = getErrorMessage(errors, name)

  if (!message) return null

  return <p className='text-red-500 text-sm mt-1'>{message}</p>
}

// 🎯 輸入欄位組件
interface InputFieldProps {
  label: string
  name: string
  type?: string
  register: any
  errors: FieldErrors<any>
  options?: Record<string, any>
  children?: React.ReactNode
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  register,
  errors,
  options = {},
  children,
}) => (
  <div>
    <label className='block text-sm font-medium mb-1'>{label}</label>
    {children || (
      <input type={type} {...register(name, options)} className='w-full p-2 border border-gray-300 rounded-md' />
    )}
    <ErrorMessage errors={errors} name={name} />
  </div>
)

// 🎯 選擇欄位組件
interface SelectFieldProps extends InputFieldProps {
  options: Array<{ value: string; label: string }>
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, register, errors, options }) => (
  <InputField label={label} name={name} register={register} errors={errors}>
    <select {...register(name)} className='w-full p-2 border border-gray-300 rounded-md'>
      <option value=''>請選擇{label}</option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  </InputField>
)

// 🎯 複選框組件
interface CheckboxGroupProps {
  label: string
  name: string
  options: string[]
  register: any
  errors: FieldErrors<any>
  columns?: number
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, name, options, register, errors, columns = 2 }) => (
  <div>
    <label className='block text-sm font-medium mb-2'>{label}</label>
    <div className={`grid md:grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <label key={option} className='flex items-center'>
          <input type='checkbox' value={option} {...register(name)} className='mr-2' />
          {option}
        </label>
      ))}
    </div>
    <ErrorMessage errors={errors} name={name} />
  </div>
)

// 🎯 主要組件
export const Step2: React.FC = () => {
  const { formData, setStepValid, setStepCompleted } = useMultiStepFormStore()

  const userType = formData.step1?.userType || ''
  const schema = getSchemaByUserType(userType)

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
              <InputField label='名字' name='personalInfo.firstName' register={register} errors={errors} />
              <InputField label='姓氏' name='personalInfo.lastName' register={register} errors={errors} />
              <InputField
                label='出生日期'
                name='personalInfo.dateOfBirth'
                type='date'
                register={register}
                errors={errors}
              />
              <InputField
                label='年收入'
                name='personalInfo.income'
                type='number'
                register={register}
                errors={errors}
                options={{ valueAsNumber: true }}
              />
            </div>
          </div>
        )

      case 'business':
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>企業資訊</h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <InputField label='公司名稱' name='businessInfo.companyName' register={register} errors={errors} />
              <SelectField
                label='行業'
                name='businessInfo.industry'
                register={register}
                errors={errors}
                options={[
                  { value: 'technology', label: '科技業' },
                  { value: 'finance', label: '金融業' },
                  { value: 'manufacturing', label: '製造業' },
                  { value: 'retail', label: '零售業' },
                ]}
              />
              <InputField
                label='員工數'
                name='businessInfo.employees'
                type='number'
                register={register}
                errors={errors}
                options={{ valueAsNumber: true }}
              />
              <InputField
                label='年營收'
                name='businessInfo.revenue'
                type='number'
                register={register}
                errors={errors}
                options={{ valueAsNumber: true }}
              />
            </div>
          </div>
        )

      case 'enterprise':
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>組織資訊</h3>
            <div className='space-y-4'>
              <InputField label='組織名稱' name='enterpriseInfo.organizationName' register={register} errors={errors} />
              <CheckboxGroup
                label='相關部門'
                name='enterpriseInfo.departments'
                options={['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal']}
                register={register}
                errors={errors}
                columns={3}
              />
              <div className='grid md:grid-cols-2 gap-4'>
                <InputField
                  label='預算'
                  name='enterpriseInfo.budget'
                  type='number'
                  register={register}
                  errors={errors}
                  options={{ valueAsNumber: true }}
                />
                <SelectField
                  label='時間線'
                  name='enterpriseInfo.timeline'
                  register={register}
                  errors={errors}
                  options={[
                    { value: 'immediate', label: '立即' },
                    { value: '1-3months', label: '1-3 個月' },
                    { value: '3-6months', label: '3-6 個月' },
                    { value: '6months+', label: '6 個月以上' },
                  ]}
                />
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
          <InputField label='聯絡信箱' name='contactEmail' type='email' register={register} errors={errors} />
          <InputField label='電話號碼' name='phone' type='tel' register={register} errors={errors} />
        </div>

        <CheckboxGroup
          label='偏好設定'
          name='preferences'
          options={['電子郵件通知', '簡訊通知', '電話聯絡', '定期報告', '即時更新', '週報']}
          register={register}
          errors={errors}
        />
      </div>
    </div>
  )
}
