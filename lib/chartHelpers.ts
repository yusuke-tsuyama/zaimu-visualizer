import { FinancialStatement } from './types'

export function toChartData(statements: FinancialStatement[]): Record<string, string | number | null>[] {
  return statements
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map(s => {
      const row: Record<string, string | number | null> = {
        year: String(s.fiscalYear),
      }
      const keys = [
        '売上高', '営業利益', '経常利益', '当期純利益', '総資産', '純資産',
        '自己資本比率', '営業CF', '投資CF', '財務CF', 'フリーCF',
        'ROE', 'ROA', '営業利益率',
      ]
      const fieldMap: Record<string, string> = {
        '売上高': 'revenue',
        '営業利益': 'operatingProfit',
        '経常利益': 'ordinaryProfit',
        '当期純利益': 'netIncome',
        '総資産': 'totalAssets',
        '純資産': 'netAssets',
        '自己資本比率': 'equityRatio',
        '営業CF': 'operatingCF',
        '投資CF': 'investingCF',
        '財務CF': 'financingCF',
        'フリーCF': 'freeCF',
        'ROE': 'roe',
        'ROA': 'roa',
        '営業利益率': 'operatingMargin',
      }
      keys.forEach(key => {
        const field = fieldMap[key]
        const val = (s as Record<string, unknown>)[field]
        row[key] = (val === undefined || val === null) ? null : Number(val)
      })
      return row
    })
}

export function calcDelta(
  current: number | null,
  previous: number | null
): { value: number | null; sign: 'up' | 'down' | 'flat' } {
  if (current === null || previous === null || previous === 0) {
    return { value: null, sign: 'flat' }
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  return {
    value: Math.round(pct * 10) / 10,
    sign: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  }
}

export function formatValue(
  value: number | null | undefined,
  unit: string,
  isPercent = false
): string {
  if (value === null || value === undefined) return '—'
  if (isPercent) return value.toFixed(1) + '%'
  return value.toLocaleString() + unit
}
