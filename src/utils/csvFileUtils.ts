// CSV 文件工具函數 - Functional Programming 風格

// 🚀 純函數：數據類型定義
export interface CsvRow extends Record<string, unknown> {
  id?: string | number
}

export interface CsvValidationResult {
  readonly valid: boolean
  readonly message: string
}

export interface CsvParseResult {
  readonly success: boolean
  readonly data?: CsvRow[]
  readonly error?: string
}

// 🎯 純函數：驗證文件
export const validateCsvFile = (file: File): CsvValidationResult => {
  const isValidExtension = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
  const isValidSize = file.size <= 10 * 1024 * 1024 && file.size > 0

  if (!isValidExtension) {
    return { valid: false, message: '請選擇 CSV 文件（.csv）' }
  }

  if (!isValidSize) {
    return file.size === 0
      ? { valid: false, message: '文件不能為空' }
      : { valid: false, message: '文件大小不能超過 10MB' }
  }

  return { valid: true, message: '文件驗證通過' }
}

// 🎯 純函數：解析 CSV 行
const parseCsvLine = (line: string): string[] => line.split(',').map((value) => value.trim().replace(/"/g, ''))

// 🎯 純函數：轉換數據類型
const convertValue = (value: string): string | number => (value && !isNaN(Number(value)) ? Number(value) : value)

// 🎯 純函數：創建數據行
const createDataRow =
  (headers: string[]) =>
  (values: string[], index: number): CsvRow | null => {
    if (values.length !== headers.length) return null

    const row = headers.reduce(
      (acc, header, i) => ({
        ...acc,
        [header]: convertValue(values[i]),
      }),
      {} as CsvRow
    )

    return { ...row, id: Date.now() + Math.random() + index }
  }

// 🎯 純函數：解析 CSV 文本
export const parseCsvText = (csvText: string): CsvParseResult => {
  try {
    const lines = csvText
      .trim()
      .split('\n')
      .filter((line) => line.trim())

    if (lines.length === 0) {
      return { success: false, error: 'CSV 文件為空' }
    }

    const headers = parseCsvLine(lines[0])

    if (headers.length === 0 || headers.some((header) => !header)) {
      return { success: false, error: 'CSV 標題行格式錯誤' }
    }

    const createRow = createDataRow(headers)
    const dataRows = lines
      .slice(1)
      .map(parseCsvLine)
      .map(createRow)
      .filter((row): row is CsvRow => row !== null)

    if (dataRows.length === 0) {
      return { success: false, error: 'CSV 文件中沒有有效的數據行' }
    }

    return { success: true, data: dataRows }
  } catch (error) {
    return { success: false, error: `CSV 解析失敗：${(error as Error).message}` }
  }
}

// 🎯 純函數：讀取文件內容
const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('文件讀取失敗'))
    reader.readAsText(file, 'UTF-8')
  })

// 🎯 組合函數：讀取並解析 CSV 文件
export const readCsvFile = async (file: File): Promise<CsvParseResult> => {
  const validation = validateCsvFile(file)

  if (!validation.valid) {
    return { success: false, error: validation.message }
  }

  try {
    const csvText = await readFileAsText(file)
    return parseCsvText(csvText)
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// 🎯 純函數：格式化 CSV 值
const formatCsvValue = (value: unknown): string => {
  const stringValue = String(value || '')
  return stringValue.includes(',') || stringValue.includes('"') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
}

// 🎯 純函數：提取表頭
const extractHeaders = (data: CsvRow[]): string[] =>
  data.length > 0 ? Object.keys(data[0]).filter((key) => key !== 'id') : []

// 🎯 純函數：轉換數據為 CSV 行
const dataRowToCsvRow =
  (headers: string[]) =>
  (row: CsvRow): string =>
    headers.map((header) => formatCsvValue(row[header])).join(',')

// 🎯 純函數：生成 CSV 內容
export const generateCsvContent = (data: CsvRow[]): string => {
  if (data.length === 0) return ''

  const headers = extractHeaders(data)
  const toCsvRow = dataRowToCsvRow(headers)
  const dataRows = data.map(toCsvRow)

  return [headers.join(','), ...dataRows].join('\n')
}

// 🎯 純函數：創建下載 Blob
const createCsvBlob = (content: string): Blob => new Blob([content], { type: 'text/csv;charset=utf-8;' })

// 🎯 副作用函數：下載文件
const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
}

// 🎯 組合函數：導出數據為 CSV
export const exportDataToCsv = (data: CsvRow[], filename: string = 'exported_data'): CsvParseResult => {
  if (data.length === 0) {
    return { success: false, error: '沒有數據可導出' }
  }

  try {
    const content = generateCsvContent(data)
    const blob = createCsvBlob(content)
    downloadBlob(blob, filename)
    return { success: true }
  } catch (error) {
    return { success: false, error: `導出失敗：${(error as Error).message}` }
  }
}

// 🎯 常量：示例數據
const EXAMPLE_CSV_DATA: readonly (readonly string[])[] = [
  ['name', 'email', 'age', 'department', 'salary', 'joinDate'] as const,
  ['John Doe', 'john@example.com', '30', 'Engineering', '75000', '2022-01-15'] as const,
  ['Jane Smith', 'jane@example.com', '25', 'Design', '65000', '2022-03-20'] as const,
  ['Bob Johnson', 'bob@example.com', '35', 'Marketing', '70000', '2021-11-10'] as const,
  ['Alice Brown', 'alice@example.com', '28', 'Engineering', '72000', '2022-02-28'] as const,
  ['Charlie Davis', 'charlie@example.com', '32', 'Sales', '68000', '2021-12-05'] as const,
  ['Eva Wilson', 'eva@example.com', '29', 'Design', '66000', '2022-04-12'] as const,
  ['Frank Miller', 'frank@example.com', '31', 'Engineering', '78000', '2021-10-20'] as const,
  ['Grace Lee', 'grace@example.com', '26', 'Marketing', '64000', '2022-05-08'] as const,
] as const

// 🎯 純函數：生成示例 CSV 內容
export const generateExampleCsvContent = (): string => EXAMPLE_CSV_DATA.map((row) => row.join(',')).join('\n')

// 🎯 副作用函數：下載示例 CSV
export const downloadExampleCsv = (): void => {
  const content = generateExampleCsvContent()
  const blob = createCsvBlob(content)
  const timestamp = new Date().getTime()
  downloadBlob(blob, `example_employees_${timestamp}.csv`)
}

// 🎯 純函數：生成簡單示例內容（用於複製貼上）
export const generateSimpleExampleCsv = (): string => {
  const simpleData = EXAMPLE_CSV_DATA.slice(0, 4) // 只取前4行
  return simpleData.map((row) => row.join(',')).join('\n')
}

// 🎯 副作用函數：複製到剪貼簿
export const copyToClipboard = async (text: string): Promise<CsvParseResult> => {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (error) {
    console.error('複製到剪貼簿失敗:', error)
    return { success: false, error: '複製到剪貼簿失敗' }
  }
}

// 🎯 組合函數：複製示例 CSV
export const copyExampleCsv = async (): Promise<CsvParseResult> => {
  const content = generateSimpleExampleCsv()
  return copyToClipboard(content)
}
