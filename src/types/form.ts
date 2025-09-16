export interface FormData {
  // Step 1: 基本資訊
  step1: {
    userType: 'individual' | 'business' | 'enterprise'
    region: 'asia' | 'europe' | 'americas'
    category: string
    priority: 'low' | 'medium' | 'high'
  }

  // Step 2: 詳細設定 (根據 Step 1 的選擇而變化)
  step2: {
    // Individual 專用欄位
    personalInfo?: {
      firstName: string
      lastName: string
      dateOfBirth: string
      income: number
    }

    // Business 專用欄位
    businessInfo?: {
      companyName: string
      industry: string
      employees: number
      revenue: number
    }

    // Enterprise 專用欄位
    enterpriseInfo?: {
      organizationName: string
      departments: string[]
      budget: number
      timeline: string
    }

    // 共用欄位
    contactEmail: string
    phone: string
    preferences: string[]
  }

  // Step 3: 進階選項
  step3: {
    features: string[]
    customRequirements: string
    agreedToTerms: boolean
    marketingConsent: boolean

    // 根據前面選擇的條件性欄位
    additionalServices?: string[]
    supportLevel?: 'basic' | 'premium' | 'enterprise'
  }
}

export interface FormStep {
  id: number
  title: string
  description: string
  isCompleted: boolean
  isValid: boolean
}
