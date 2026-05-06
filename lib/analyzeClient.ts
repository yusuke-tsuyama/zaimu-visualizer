import { ExtractedData, FinancialStatement, AiComment } from './types'

export async function extractAndAnalyzePdf(
  file: File,
  fiscalYear: number,
): Promise<ExtractedData> {
  const formData = new FormData()
  formData.append('file', file)

  const extractRes = await fetch('/api/extract-pdf', {
    method: 'POST',
    body: formData,
  })

  if (!extractRes.ok) {
    const err = await extractRes.json()
    throw new Error(err.error ?? 'PDF抽出に失敗しました')
  }

  const extracted = await extractRes.json()

  if (!extracted.extractedText || extracted.extractedText.trim().length < 200) {
    return {
      companyName: '',
      fiscalYear,
      statements: emptyStatements(),
      confidence: { revenue: 'low', operatingProfit: 'low', netIncome: 'low' },
      warnings: ['PDFからテキストを抽出できませんでした。手動入力をお試しください。'],
      rawText: '',
    }
  }

  const analyzeRes = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      extractedText: extracted.extractedText,
      fileName: file.name,
      fiscalYear,
      unit: extracted.unit,
      statementType: extracted.statementType,
    }),
  })

  if (!analyzeRes.ok) {
    const err = await analyzeRes.json()
    throw new Error(err.error ?? 'Claude API解析に失敗しました')
  }

  const analyzed = await analyzeRes.json()
  const data = analyzed.data

  return {
    companyName: data.companyName ?? '',
    fiscalYear: data.fiscalYear ?? fiscalYear,
    statements: {
      revenue: toNumber(data.statements?.revenue),
      operatingProfit: toNumber(data.statements?.operatingProfit),
      ordinaryProfit: toNumber(data.statements?.ordinaryProfit),
      netIncome: toNumber(data.statements?.netIncome),
      totalAssets: toNumber(data.statements?.totalAssets),
      totalLiabilities: toNumber(data.statements?.totalLiabilities),
      netAssets: toNumber(data.statements?.netAssets),
      equityRatio: toNumber(data.statements?.equityRatio),
      operatingCF: toNumber(data.statements?.operatingCF),
      investingCF: toNumber(data.statements?.investingCF),
      financingCF: toNumber(data.statements?.financingCF),
      freeCF: toNumber(data.statements?.freeCF),
      roe: toNumber(data.statements?.roe),
      roa: toNumber(data.statements?.roa),
      operatingMargin: toNumber(data.statements?.operatingMargin),
    },
    confidence: data.confidence ?? {
      revenue: 'low',
      operatingProfit: 'low',
      netIncome: 'low',
    },
    warnings: data.warnings ?? [],
    rawText: extracted.extractedText,
  }
}

export async function generateAiComment(
  statements: FinancialStatement[],
  companyName: string,
): Promise<AiComment> {
  const res = await fetch('/api/ai-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statements, companyName }),
  })
  if (!res.ok) throw new Error('AIコメント生成に失敗しました')
  const json = await res.json()
  return json.data
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function emptyStatements() {
  return {
    revenue: null, operatingProfit: null, ordinaryProfit: null,
    netIncome: null, totalAssets: null, totalLiabilities: null,
    netAssets: null, equityRatio: null, operatingCF: null,
    investingCF: null, financingCF: null, freeCF: null,
    roe: null, roa: null, operatingMargin: null,
  }
}
