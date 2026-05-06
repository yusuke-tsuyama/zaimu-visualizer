export interface FinancialStatement {
  fiscalYear: number
  revenue: number | null
  operatingProfit: number | null
  ordinaryProfit: number | null
  netIncome: number | null
  totalAssets: number | null
  totalLiabilities: number | null
  netAssets: number | null
  equityRatio: number | null
  operatingCF: number | null
  investingCF: number | null
  financingCF: number | null
  freeCF: number | null
  roe: number | null
  roa: number | null
  operatingMargin: number | null
  unit: '百万円' | '千円' | '円'
  statementType: '連結' | '個別'
  sourceFileName?: string
}

export interface ExtractedData {
  companyName: string
  fiscalYear: number
  statements: Omit<FinancialStatement, 'fiscalYear' | 'unit' | 'statementType' | 'sourceFileName'>
  confidence: {
    revenue: 'high' | 'medium' | 'low'
    operatingProfit: 'high' | 'medium' | 'low'
    netIncome: 'high' | 'medium' | 'low'
  }
  warnings: string[]
  rawText?: string
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
