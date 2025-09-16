import { NextRequest, NextResponse } from 'next/server'
import { FormData } from '@/types/form'

export async function POST(request: NextRequest) {
  try {
    const formData: Partial<FormData> = await request.json()

    // 這裡可以加入資料驗證
    if (!formData.step1 || !formData.step2 || !formData.step3) {
      return NextResponse.json({ error: '表單資料不完整' }, { status: 400 })
    }

    // 模擬處理邏輯
    console.log('收到表單資料:', formData)

    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 根據表單資料生成查詢結果
    const queryResult = {
      id: Date.now(),
      userType: formData.step1.userType,
      recommendedProducts: generateRecommendations(formData),
      estimatedCost: calculateCost(formData),
      timeline: formData.step3?.supportLevel === 'enterprise' ? '1-2 weeks' : '2-4 weeks',
    }

    return NextResponse.json({
      success: true,
      message: '查詢成功！',
      data: queryResult,
    })
  } catch (error) {
    console.error('表單提交錯誤:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

function generateRecommendations(formData: Partial<FormData>) {
  const userType = formData.step1?.userType
  const features = formData.step3?.features || []

  // 根據用戶類型和選擇的功能生成推薦
  const baseRecommendations = ['基礎套餐']

  if (userType === 'enterprise') {
    baseRecommendations.push('企業進階套餐', 'API 整合方案')
  } else if (userType === 'business') {
    baseRecommendations.push('商業套餐')
  }

  if (features.includes('進階分析')) {
    baseRecommendations.push('分析工具擴充包')
  }

  return baseRecommendations
}

function calculateCost(formData: Partial<FormData>) {
  const userType = formData.step1?.userType
  const supportLevel = formData.step3?.supportLevel

  let baseCost = 0

  switch (userType) {
    case 'individual':
      baseCost = 99
      break
    case 'business':
      baseCost = 299
      break
    case 'enterprise':
      baseCost = 999
      break
  }

  if (supportLevel === 'premium') {
    baseCost *= 1.5
  } else if (supportLevel === 'enterprise') {
    baseCost *= 2
  }

  return baseCost
}
