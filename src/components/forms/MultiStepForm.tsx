import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'
import { StepIndicator } from './StepIndicator'
import { useMultiStepFormStore } from '@/store/multiStepForm'

export const MultiStepForm: React.FC = () => {
  const {
    currentStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    submitForm,
    isSubmitting,
    submitError,
    resetForm,
  } = useMultiStepFormStore()

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />
      case 2:
        return <Step2 />
      case 3:
        return <Step3 />
      default:
        return null
    }
  }

  const handleSubmit = async () => {
    if (isLastStep()) {
      await submitForm()
    } else {
      nextStep()
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg p-8'>
        <StepIndicator />

        {/* 錯誤訊息 */}
        {submitError && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex'>
              <div className='text-red-400'>⚠</div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>提交失敗</h3>
                <div className='mt-1 text-sm text-red-700'>{submitError}</div>
              </div>
            </div>
          </div>
        )}

        {/* 當前步驟內容 */}
        <div className='mb-8'>{renderCurrentStep()}</div>

        {/* 導航按鈕 */}
        <div className='flex justify-between'>
          <div>
            {canGoPrev() && (
              <button
                type='button'
                onClick={prevStep}
                className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
              >
                上一步
              </button>
            )}
          </div>

          <div className='flex space-x-3'>
            <button
              type='button'
              onClick={resetForm}
              className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
            >
              重設表單
            </button>

            <button
              type='button'
              onClick={handleSubmit}
              disabled={(!canGoNext() && !isLastStep()) || isSubmitting}
              className='px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? '提交中...' : isLastStep() ? 'Query 查詢' : '下一步'}
            </button>
          </div>
        </div>

        {/* 表單資料預覽 (開發模式) */}
        {process.env.NODE_ENV === 'development' && (
          <details className='mt-8'>
            <summary className='cursor-pointer text-sm text-gray-500'>開發模式：查看表單資料</summary>
            <pre className='mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto'>
              {JSON.stringify(useMultiStepFormStore.getState().formData, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
