import { FinancialStatement } from '@/lib/types'
import { formatValue } from '@/lib/chartHelpers'

interface Props {
  latest: FinancialStatement
  previous: FinancialStatement | null
}

export default function LinkageCard({ latest, previous }: Props) {
  const unit = latest.unit as string
  const insights: { text: string; type: 'info' | 'warn' | 'ok' }[] = []

  const operatingCF = (latest as Record<string, unknown>).operatingCF as number | null
  const netIncome = (latest as Record<string, unknown>).netIncome as number | null
  const investingCF = (latest as Record<string, unknown>).investingCF as number | null
  const equityRatio = (latest as Record<string, unknown>).equityRatio as number | null
  const prevEquityRatio = previous ? (previous as Record<string, unknown>).equityRatio as number | null : null

  if (operatingCF !== null && netIncome !== null && netIncome > 0) {
    const ratio = operatingCF / netIncome
    if (ratio >= 1.2) insights.push({ text: '営業CFは純利益の' + ratio.toFixed(1) + '倍あり、利益が現金として十分に回収されています。', type: 'ok' })
    else if (ratio < 0.5) insights.push({ text: '営業CFが純利益を大きく下回っています。売上債権や在庫の動向を確認してみましょう。', type: 'warn' })
  }
  if (investingCF !== null && investingCF < 0) {
    insights.push({ text: '投資CFのマイナスは設備・事業投資の支出を示します。成長投資か維持投資かを確認しましょう。', type: 'info' })
  }
  if (equityRatio !== null && prevEquityRatio !== null) {
    const diff = equityRatio - prevEquityRatio
    if (Math.abs(diff) >= 2) insights.push({ text: '自己資本比率が前期比 ' + (diff > 0 ? '+' : '') + diff.toFixed(1) + 'pt 変化しています。', type: diff > 0 ? 'ok' : 'warn' })
  }
  if (insights.length === 0) insights.push({ text: '財務三表を並べて読むことで、利益・資産・現金の関係が見えてきます。', type: 'info' })

  const typeStyle = {
    ok: 'border-l-emerald-400 bg-emerald-50 text-emerald-800',
    warn: 'border-l-amber-400 bg-amber-50 text-amber-800',
    info: 'border-l-blue-400 bg-blue-50 text-blue-800',
  }

  const getVal = (obj: FinancialStatement, key: string) => (obj as Record<string, unknown>)[key] as number | null

  const boxes = [
    { tag: 'P/L', title: '損益計算書', color: 'border-blue-500', items: [
      { label: '売上高', value: formatValue(getVal(latest, 'revenue'), unit) },
      { label: '営業利益', value: formatValue(getVal(latest, 'operatingProfit'), unit) },
      { label: '純利益', value: formatValue(getVal(latest, 'netIncome'), unit) },
    ]},
    { tag: 'B/S', title: '貸借対照表', color: 'border-indigo-500', items: [
      { label: '総資産', value: formatValue(getVal(latest, 'totalAssets'), unit) },
      { label: '純資産', value: formatValue(getVal(latest, 'netAssets'), unit) },
      { label: '自己資本比率', value: formatValue(getVal(latest, 'equityRatio'), unit, true) },
    ]},
    { tag: 'C/F', title: 'CF計算書', color: 'border-cyan-500', items: [
      { label: '営業CF', value: formatValue(getVal(latest, 'operatingCF'), unit) },
      { label: '投資CF', value: formatValue(getVal(latest, 'investingCF'), unit) },
      { label: 'フリーCF', value: formatValue(getVal(latest, 'freeCF'), unit) },
    ]},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2">
        {boxes.map((box, i) => (
          <div key={i} className="flex-1">
            <div className={'bg-white rounded-xl border-t-4 border-gray-200 p-3 ' + box.color}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{box.tag}</span>
                <span className="text-xs text-gray-500">{box.title}</span>
              </div>
              {box.items.map((item, j) => (
                <div key={j} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className={'border-l-4 px-3 py-2 rounded-r-lg text-xs leading-relaxed ' + typeStyle[ins.type]}>{ins.text}</div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">学習補助目的のコメントです。投資判断にはご利用いただけません。</p>
    </div>
  )
}
