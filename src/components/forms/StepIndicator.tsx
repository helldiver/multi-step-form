import { useMultiStepFormStore } from '@/store/multiStepForm'

export const StepIndicator: React.FC = () => {
  const { currentStep, steps, getStepProgress } = useMultiStepFormStore()

  return (
    <div className='mb-8'>
      {/* 進度條 */}
      <div className='mb-6'>
        <div className='flex justify-between text-sm text-gray-600 mb-2'>
          <span>進度</span>
          <span>{Math.round(getStepProgress())}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-blue-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {/* 步驟指示器 */}
      <div className='flex justify-between'>
        {steps.map((step, index) => (
          <div key={step.id} className='flex-1'>
            <div className='flex items-center'>
              {/* 步驟圓圈 */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    step.id === currentStep
                      ? 'bg-blue-500 text-white'
                      : step.isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {step.isCompleted ? '✓' : step.id}
              </div>

              {/* 連接線 */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2
                    ${step.isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>

            {/* 步驟標題 */}
            <div className='mt-2'>
              <div
                className={`
                  text-sm font-medium
                  ${step.id === currentStep ? 'text-blue-500' : 'text-gray-600'}
                `}
              >
                {step.title}
              </div>
              <div className='text-xs text-gray-500 mt-1'>{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
