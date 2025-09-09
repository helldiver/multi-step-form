import { FormStep } from '@/types/form'

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: '基本資訊',
    description: '選擇您的用戶類型和基本需求',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 2,
    title: '詳細設定',
    description: '填寫詳細的個人或企業資訊',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 3,
    title: '進階選項',
    description: '選擇功能和服務選項',
    isCompleted: false,
    isValid: false,
  },
]

export const USER_TYPE_OPTIONS = [
  { value: 'individual', label: '個人用戶', description: '適合個人使用' },
  { value: 'business', label: '企業用戶', description: '適合中小企業' },
  { value: 'enterprise', label: '大型企業', description: '適合大型組織' },
]

export const REGION_OPTIONS = [
  { value: 'asia', label: '亞洲地區' },
  { value: 'europe', label: '歐洲地區' },
  { value: 'americas', label: '美洲地區' },
]
