import { useEffect } from 'react'
import { FieldErrors, FieldValues } from 'react-hook-form'
import { useFormSync } from './useFormSync'
import type { UseFormSyncOptions } from './useFormSync'

interface UseFormSyncWithValidationOptions<T extends FieldValues> extends UseFormSyncOptions<T> {
  errors: FieldErrors<T>
  onSyncSuccess?: (data: T) => void
  onSyncError?: (errors: FieldErrors<T>) => void
  onValidationChange?: (isValid: boolean) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFormSyncWithValidation = <T extends FieldValues = any>({
  errors,
  onSyncSuccess,
  onSyncError,
  onValidationChange,
  ...syncOptions
}: UseFormSyncWithValidationOptions<T>) => {
  const syncResult = useFormSync(syncOptions)

  // 處理驗證狀態變化
  useEffect(() => {
    onValidationChange?.(syncOptions.isValid)
  }, [syncOptions.isValid, onValidationChange])

  // 處理同步成功
  useEffect(() => {
    if (syncOptions.isValid && Object.keys(errors).length === 0) {
      onSyncSuccess?.(syncOptions.formData)
    }
  }, [syncOptions.isValid, errors, syncOptions.formData, onSyncSuccess])

  // 處理同步錯誤
  useEffect(() => {
    if (!syncOptions.isValid && Object.keys(errors).length > 0) {
      onSyncError?.(errors)
    }
  }, [syncOptions.isValid, errors, onSyncError])

  return {
    ...syncResult,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
  }
}
