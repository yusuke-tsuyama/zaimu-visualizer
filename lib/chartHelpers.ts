import { FinancialStatement } from './types'

export function toChartData(statements: FinancialStatement[]): Record<string, string | number | null>[] {
  return statements
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map(s => {
      const d = s as Record<string, unknown>
      const toNum = (v: unknown): number | null => {
        if (v === null || v === undefined) return null
        const n = Number(v)
        return isNaN(n) ? null : n
      }
      return {
        year: String(s.fiscalYear),
        '売上高': toNum(d.revenue),
        '営業利益': toNum(d.operatingProfit ?? d.operating_profit),
        '経常利益': toNum(d.ordinaryProfit ?? d.ordinary_profit),
        '当期純利益': toNum(d.netIncome ?? d.net_income),
        '総資産': toNum(d.totalAssets ?? d.total_assets),
        '純資産': toNum(d.netAssets ?? d.net_assets),
        '自己資本比率': toNum(d.equityRatio ?? d.equity_ratio),
        '営業CF': toNum(d.operatingCF ?? d.operating_cf),
        '投資CF': toNum(d.investingCF ?? d.investing_cf),
        '財務CF': toNum(d.financingCF ?? d.financing_cf),
        'フリーCF': toNum(d.freeCF ?? d.free_cf),
        'ROE': toNum(d.roe),
        'ROA': toNum(d.roa),
        '営業利益率': toNum(d.operatingMargin ?? d.operating_margin),
      }
    })
}

export function calcDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
  isRatio = false,
): { value: number | null; sign: 'up' | 'down' | 'flat' } {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return { value: null, sign: 'flat' }
  }
  if (isRatio) {
    const diff = current - previous
    return {
      value: Math.round(diff * 10) / 10,
      sign: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    }
  }
  if (previous === 0) {
    return { value: null, sign: 'flat' }
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  return {
    value: Math.round(pct * 10) / 10,
    sign: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  }
}

export function formatAxisValue(v: unknown): string {
  const n = Number(v)
  if (isNaN(n)) return String(v)
  if (Math.abs(n) >= 100000) {
    return parseFloat((n / 100000).toFixed(2)).toString() + '\u5104'
  }
  return n.toLocaleString()
}

export function formatValue(
  value: number | null | undefined,
  unit: string,
  isPercent = false
): string {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (isNaN(n)) return '—'
  if (isPercent) return n.toFixed(1) + '%'
  return n.toLocaleString() + unit
}
