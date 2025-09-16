import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FormData, FormStep } from '@/types/form'
import { FORM_STEPS } from '@/constants/form'

interface MultiStepFormStore {
  // 表單狀態
  currentStep: number
  steps: FormStep[]
  formData: Partial<FormData>
  isSubmitting: boolean
  submitError: string | null

  // 動作
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: <K extends keyof FormData>(step: K, data: Partial<FormData[K]>) => void
  setStepValid: (stepId: number, isValid: boolean) => void
  setStepCompleted: (stepId: number, isCompleted: boolean) => void
  resetForm: () => void

  // API 相關
  submitForm: () => Promise<void>

  // 計算屬性
  canGoNext: () => boolean
  canGoPrev: () => boolean
  isLastStep: () => boolean
  getStepProgress: () => number
}

export const useMultiStepFormStore = create<MultiStepFormStore>()(
  persist(
    (set, get) => ({
      // 初始狀態
      currentStep: 1,
      steps: [...FORM_STEPS],
      formData: {},
      isSubmitting: false,
      submitError: null,

      // 步驟導航
      setCurrentStep: (step: number) => {
        const { steps } = get()
        if (step >= 1 && step <= steps.length) {
          set({ currentStep: step })
        }
      },

      nextStep: () => {
        const { currentStep, steps } = get()
        if (currentStep < steps.length) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      // 表單資料更新
      updateFormData: (step, data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: {
              ...state.formData[step],
              ...data,
            },
          },
        }))
      },

      // 步驟狀態管理
      setStepValid: (stepId: number, isValid: boolean) => {
        set((state) => ({
          steps: state.steps.map((step) => (step.id === stepId ? { ...step, isValid } : step)),
        }))
      },

      setStepCompleted: (stepId: number, isCompleted: boolean) => {
        set((state) => ({
          steps: state.steps.map((step) => (step.id === stepId ? { ...step, isCompleted } : step)),
        }))
      },

      // 表單重設
      resetForm: () => {
        set({
          currentStep: 1,
          steps: [...FORM_STEPS],
          formData: {},
          isSubmitting: false,
          submitError: null,
        })
      },

      // API 提交
      submitForm: async () => {
        set({ isSubmitting: true, submitError: null })

        try {
          const { formData } = get()

          // 模擬 API 調用
          const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })

          if (!response.ok) {
            throw new Error('提交失敗')
          }

          const result = await response.json()
          console.log('表單提交成功:', result)

          // 可以在這裡處理成功後的邏輯，比如跳轉頁面
        } catch (error) {
          set({
            submitError: error instanceof Error ? error.message : '提交時發生錯誤',
          })
        } finally {
          set({ isSubmitting: false })
        }
      },

      // 計算屬性
      canGoNext: () => {
        const { currentStep, steps } = get()
        const currentStepData = steps.find((s) => s.id === currentStep)
        return currentStepData?.isValid === true && currentStep < steps.length
      },

      canGoPrev: () => {
        const { currentStep } = get()
        return currentStep > 1
      },

      isLastStep: () => {
        const { currentStep, steps } = get()
        return currentStep === steps.length
      },

      getStepProgress: () => {
        const { steps } = get()
        const completedSteps = steps.filter((s) => s.isCompleted).length
        return (completedSteps / steps.length) * 100
      },
    }),
    {
      name: 'multi-step-form-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
        steps: state.steps,
      }),
    }
  )
)
