import { ExtractedData, FinancialStatement, AiComment } from './types'
import { deriveRatios } from './chartHelpers'
import { AccountItem } from './accountItems'

export async function extractAndAnalyzePdf(
  file: File,
  fiscalYear: number,
  accountItems?: AccountItem[],
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

  const analyzeRes = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      extractedText: extracted.extractedText ?? '',
      base64Pdf: extracted.base64Pdf,
      usePdfVision: true,
      fileName: file.name,
      fiscalYear,
      unit: extracted.unit,
      statementType: extracted.statementType,
      accountItems: accountItems?.map(item => ({ id: item.id, label: item.label })),
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
    statements: deriveRatios(data.statements ?? {}),
    confidence: data.confidence ?? {},
    warnings: data.warnings ?? [],
    rawText: extracted.extractedText ?? '',
    unit: data.unit ?? extracted.unit ?? '百万円',
    statementType: data.statementType ?? extracted.statementType ?? '連結',
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
