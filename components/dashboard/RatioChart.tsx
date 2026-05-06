cat > components/dashboard/LinkageCard.tsx << 'EOF'
import { FinancialStatement } from '@/lib/types'
import { formatValue } from '@/lib/chartHelpers'

interface Props {
  latest: FinancialStatement
  previous: FinancialStatement | null
}

export default function LinkageCard({ latest, previous }: Props) {
  const unit = latest.unit
  const insights: { text: string; type: 'info' | 'warn' | 'ok' }[] = []

  if (latest.operatingCF !== null && latest.netIncome !== null && latest.netIncome > 0) {
    const ratio = latest.operatingCF / latest.netIncome
    if (ratio >= 1.2) {
      insights.push({ text: `営業CFは純利益の${ratio.toFixed(1)}倍あり、利益が現金として十分に回収されています。`, type: 'ok' })
    } else if (ratio < 0.5) {
      insights.push({ text: `営業CFが純利益を大きく下回っています。売上債権や在庫の動向を確認してみましょう。`, type: 'warn' })
    }
  }

  if (latest.investingCF !== null && latest.investingCF < 0) {
    insights.push({ text: `投資CFのマイナスは設備・事業投資の支出を示します。成長投資か維持投資かを確認しましょう。`, type: 'info' })
  }

  if (latest.equityRatio !== null && previous?.equityRatio != null) {
    const diff = latest.equityRatio - previous.equityRatio
    if (Math.abs(diff) >= 2) {
      insights.push({
        text: `自己資本比率が前期比 ${diff > 0 ? '+' : ''}${diff.toFixed(1)}pt 変化しています。財務基盤の変化を確認しましょう。`,
        type: diff > 0 ? 'ok' : 'warn',
      })
    }
  }

  if (latest.totalAssets !== null && latest.netAssets !== null) {
    const debtRatio = (latest.totalAssets - latest.netAssets) / latest.totalAssets * 100
    if (debtRatio > 70) {
      insights.push({ text: `総資産に占める負債の割合が${debtRatio.toFixed(0)}%です。借入依存度について原資料で確認してみましょう。`, type: 'warn' })
    }
  }

  if (insights.length === 0) {
    insights.push({ text: '財務三表を並べて読むことで、利益・資産・現金の関係が見えてきます。', type: 'info' })
  }

  const typeStyle = {
    ok:   'border-l-emerald-400 bg-emerald-50 text-emerald-800',
    warn: 'border-l-amber-400 bg-amber-50 text-amber-800',
    info: 'border-l-blue-400 bg-blue-50 text-blue-800',
  }

  const boxes = [
    {
      tag: 'P/L', title: '損益計算書', color: 'border-blue-500',
      items: [
        { label: '売上高',   value: formatValue(latest.revenue, unit) },
        { label: '営業利益', value: formatValue(latest.operatingProfit, unit) },
        { label: '純利益',   value: formatValue(latest.netIncome, unit) },
      ],
    },
    {
      tag: 'B/S', title: '貸借対照表', color: 'border-indigo-500',
      items: [
        { label: '総資産',       value: formatValue(latest.totalAssets, unit) },
        { label: '純資産',       value: formatValue(latest.netAssets, unit) },
        { label: '自己資本比率', value: formatValue(latest.equityRatio, unit, true) },
      ],
    },
    {
      tag: 'C/F', title: 'CF計算書', color: 'border-cyan-500',
      items: [
        { label: '営業CF',   value: formatValue(latest.operatingCF, unit) },
        { label: '投資CF',   value: formatValue(latest.investingCF, unit) },
        { label: 'フリーCF', value: formatValue(latest.freeCF, unit) },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2">
        {boxes.map((box, i) => (
          <div key={i} className="flex-1">
            <div className={`flex-1 bg-white rounded-xl border-t-4 border-gray-200 p-3 ${box.color}`}>
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
          <div key={i} className={`border-l-4 px-3 py-2 rounded-r-lg text-xs leading-relaxed ${typeStyle[ins.type]}`}>
            {ins.text}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">
        ※ 学習補助を目的としたコメントです。投資判断にはご利用いただけません。
      </p>
    </div>
  )
}
EOF
