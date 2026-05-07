export interface FinancialStatement {
  fiscalYear: number
  [key: string]: number | null | string | undefined
  unit: '百万円' | '千円' | '円'
  statementType: '連結' | '個別'
  sourceFileName?: string
}

export interface ExtractedData {
  companyName: string
  fiscalYear: number
  statements: Record<string, number | null>
  confidence: Record<string, 'high' | 'medium' | 'low'>
  warnings: string[]
  rawText?: string
  unit?: string
  statementType?: string
}

export interface AnalysisProject {
  id: string
  companyName: string
  fiscalYearStart: number
  fiscalYearEnd: number
  memo: string
  createdAt: string
  statements: FinancialStatement[]
}

export interface UploadedFile {
  file: File
  fiscalYear: number | null
  estimatedYear: number | null
  status: 'pending' | 'extracting' | 'done' | 'error'
  extractedData?: ExtractedData
  errorMessage?: string
}

export interface AiComment {
  summary: string
  growthComment: string
  profitabilityComment: string
  safetyComment: string
  cashflowComment: string
  investmentComment: string
  riskComment: string
}
