import { useEffect, useRef, useCallback } from 'react'
import { useMultiStepFormStore } from '@/store/multiStepForm'
import { FormData } from '@/types/form'
import { isEqual } from 'lodash'

export interface UseFormSyncOptions<T = any> {
  stepKey: keyof FormData
  stepId: number
  formData: T
  isValid: boolean
  enabled?: boolean // 可選：控制是否啟用同步
  debounceMs?: number // 可選：防抖延遲時間
}

export interface UseFormSyncReturn {
  isSyncing: boolean
  lastSyncTime: Date | null
  forceSync: () => void
}

export const useFormSync = <T = any>({
  stepKey,
  stepId,
  formData,
  isValid,
  enabled = true,
  debounceMs = 0,
}: UseFormSyncOptions<T>): UseFormSyncReturn => {
  const { updateFormData, setStepValid, setStepCompleted } = useMultiStepFormStore()

  // 追蹤上次的值
  const prevDataRef = useRef<T>()
  const prevValidRef = useRef<boolean>()
  const lastSyncTimeRef = useRef<Date | null>(null)
  const isSyncingRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // 強制同步函數
  const forceSync = useCallback(() => {
    if (!enabled) return

    isSyncingRef.current = true
    updateFormData(stepKey, formData)
    prevDataRef.current = formData
    lastSyncTimeRef.current = new Date()
    isSyncingRef.current = false
  }, [enabled, stepKey, formData, updateFormData])

  // 防抖更新函數
  const debouncedUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      forceSync()
    }, debounceMs)
  }, [forceSync, debounceMs])

  // 同步表單資料
  useEffect(() => {
    if (!enabled) return

    // 檢查是否有實際變化
    const hasDataChanged = !isEqual(prevDataRef.current, formData)

    if (hasDataChanged) {
      if (debounceMs > 0) {
        debouncedUpdate()
      } else {
        forceSync()
      }
    }
  }, [formData, enabled, forceSync, debouncedUpdate, debounceMs])

  // 同步驗證狀態
  useEffect(() => {
    if (!enabled) return

    if (prevValidRef.current !== isValid) {
      setStepValid(stepId, isValid)

      if (isValid && !prevValidRef.current) {
        // 從無效變為有效時，標記為已完成
        setStepCompleted(stepId, true)
      }

      prevValidRef.current = isValid
    }
  }, [isValid, stepId, enabled, setStepValid, setStepCompleted])

  // 清理定時器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    isSyncing: isSyncingRef.current,
    lastSyncTime: lastSyncTimeRef.current,
    forceSync: forceSync,
  }
}
