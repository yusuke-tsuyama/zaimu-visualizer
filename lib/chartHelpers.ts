cat > lib/chartHelpers.ts << 'EOF'
import { FinancialStatement } from './types'

export function toChartData(statements: FinancialStatement[]) {
  return statements
    .sort((a, b) => a.fiscalYear - b.fiscalYear)
    .map(s => ({
      year: `${s.fiscalYear}`,
      売上高: s.revenue,
      営業利益: s.operatingProfit,
      経常利益: s.ordinaryProfit,
      当期純利益: s.netIncome,
      総資産: s.totalAssets,
      純資産: s.netAssets,
      自己資本比率: s.equityRatio,
      営業CF: s.operatingCF,
      投資CF: s.investingCF,
      財務CF: s.financingCF,
      フリーCF: s.freeCF,
      ROE: s.roe,
      ROA: s.roa,
      営業利益率: s.operatingMargin,
    }))
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
  value: number | null,
  unit: string,
  isPercent = false
): string {
  if (value === null) return '—'
  if (isPercent) return `${value.toFixed(1)}%`
  const abs = Math.abs(value)
  if (abs >= 100000) return `${(value / 100000).toFixed(1)}兆円`
  if (abs >= 10000) return `${(value / 10000).toFixed(0)}億円`
  return `${value.toLocaleString()}${unit}`
}
EOF
