'use client'

import { ExtractedData } from '@/lib/types'
import { AccountItem, STATEMENT_LABELS, CATEGORY_ORDER, StatementType } from '@/lib/accountItems'

interface Props {
  data: ExtractedData
  accountItems: AccountItem[]
  unit: string
  statementType: string
  onDataChange: (updated: ExtractedData) => void
  onUnitChange: (unit: string) => void
  onStatementTypeChange: (type: string) => void
  onCompanyNameChange: (name: string) => void
}

const CONFIDENCE_CONFIG = {
  high:   { label: '高', className: 'bg-green-100 text-green-700' },
  medium: { label: '中', className: 'bg-yellow-100 text-yellow-700' },
  low:    { label: '低', className: 'bg-red-100 text-red-600' },
}

export default function ReviewTable({
  data, accountItems, unit, statementType,
  onDataChange, onUnitChange, onStatementTypeChange, onCompanyNameChange,
}: Props) {

  const handleValueChange = (key: string, value: string) => {
    const num = value === '' || value === '-' ? null : Number(value)
    onDataChange({ ...data, statements: { ...data.statements, [key]: num } })
  }

  const statementTypes: StatementType[] = ['bs', 'pl', 'cf']

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">基本情報</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">企業名</label>
            <input
              type="text"
              value={data.companyName}
              onChange={e => onCompanyNameChange(e.target.value)}
              placeholder="例：トヨタ自動車株式会社"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">会計年度</label>
            <input type="number" value={data.fiscalYear} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">種別</label>
            <select value={statementType} onChange={e => onStatementTypeChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="連結">連結</option>
              <option value="個別">個別（単体）</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">単位</label>
            <select value={unit} onChange={e => onUnitChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="百万円">百万円</option>
              <option value="千円">千円</option>
              <option value="円">円</option>
            </select>
          </div>
        </div>
      </div>

      {data.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-amber-800 mb-1">⚠ 抽出に注意が必要な項目があります</p>
          {data.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700">・{w}</p>)}
        </div>
      )}

      {statementTypes.map(stType => {
        const itemsForType = accountItems.filter(item => item.statementType === stType)
        if (itemsForType.length === 0) return null
        const categories = CATEGORY_ORDER[stType] ?? [...new Set(itemsForType.map(i => i.category))]

        return (
          <div key={stType} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">{STATEMENT_LABELS[stType]}</span>
            </div>
            {categories.map(cat => {
              const catItems = itemsForType.filter(i => i.category === cat)
              if (catItems.length === 0) return null
              return (
                <div key={cat}>
                  <div className="px-4 py-1.5 bg-gray-50/50 border-b border-gray-100">
                    <span className="text-xs text-gray-400">{cat}</span>
                  </div>
                  {catItems.map(field => {
                    const val = data.statements[field.id] ?? null
                    const conf = data.confidence[field.id] as 'high' | 'medium' | 'low' | undefined
                    const confConfig = conf ? CONFIDENCE_CONFIG[conf] : null
                    const isPercent = field.label.includes('%') || field.label.includes('比率') || field.label.includes('ROE') || field.label.includes('ROA') || field.label.includes('利益率')
                    return (
                      <div key={field.id} className="flex items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 px-4 py-2">
                        <span className="flex-1 text-sm text-gray-700">{field.label}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={val ?? ''}
                            onChange={e => handleValueChange(field.id, e.target.value)}
                            placeholder="未取得"
                            step={isPercent ? '0.01' : '1'}
                            className={`w-36 text-right border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400 ${val === null ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300 text-gray-900'}`}
                          />
                          <span className="text-xs text-gray-400 w-10">{isPercent ? '%' : unit}</span>
                        </div>
                        {confConfig && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-1 ${confConfig.className}`}>{confConfig.label}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
        AIによる抽出結果です。必ず原資料と照合し、誤りがあれば修正してください。
      </div>
    </div>
  )
}
