import { useCallback } from 'react'

// 🎯 Hook：通知系統
export const useNotification = () => {
  const showSuccess = useCallback((message: string) => {
    // 可以替換為 toast 庫
    alert(`✅ ${message}`)
  }, [])

  const showError = useCallback((message: string) => {
    // 可以替換為 toast 庫
    alert(`❌ ${message}`)
  }, [])

  return { showSuccess, showError }
}

export default useNotification
