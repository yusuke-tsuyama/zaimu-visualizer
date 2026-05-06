'use client'

import { ExtractedData, FinancialStatement } from '@/lib/types'

interface Field {
  key: keyof ExtractedData['statements']
  label: string
  group: string
  isPercent?: boolean
}

const FIELDS: Field[] = [
  { key: 'revenue',          label: '売上高',       group: 'P/L（損益計算書）' },
  { key: 'operatingProfit',  label: '営業利益',     group: 'P/L（損益計算書）' },
  { key: 'ordinaryProfit',   label: '経常利益',     group: 'P/L（損益計算書）' },
  { key: 'netIncome',        label: '当期純利益',   group: 'P/L（損益計算書）' },
  { key: 'operatingMargin',  label: '営業利益率',   group: 'P/L（損益計算書）', isPercent: true },
  { key: 'totalAssets',      label: '総資産',       group: 'B/S（貸借対照表）' },
  { key: 'totalLiabilities', label: '総負債',       group: 'B/S（貸借対照表）' },
  { key: 'netAssets',        label: '純資産',       group: 'B/S（貸借対照表）' },
  { key: 'equityRatio',      label: '自己資本比率', group: 'B/S（貸借対照表）', isPercent: true },
  { key: 'operatingCF',      label: '営業CF',       group: 'C/F（キャッシュフロー）' },
  { key: 'investingCF',      label: '投資CF',       group: 'C/F（キャッシュフロー）' },
  { key: 'financingCF',      label: '財務CF',       group: 'C/F（キャッシュフロー）' },
  { key: 'freeCF',           label: 'フリーCF',     group: 'C/F（キャッシュフロー）' },
  { key: 'roe',              label: 'ROE',          group: '収益性指標', isPercent: true },
  { key: 'roa',              label: 'ROA',          group: '収益性指標', isPercent: true },
]

const CONFIDENCE_CONFIG = {
  high:   { label: '高', className: 'bg-green-100 text-green-700' },
  medium: { label: '中', className: 'bg-yellow-100 text-yellow-700' },
  low:    { label: '低', className: 'bg-red-100 text-red-600' },
}

interface Props {
  data: ExtractedData
  unit: FinancialStatement['unit']
  statementType: FinancialStatement['statementType']
  onDataChange: (updated: ExtractedData) => void
  onUnitChange: (unit: FinancialStatement['unit']) => void
  onStatementTypeChange: (type: FinancialStatement['statementType']) => void
  onCompanyNameChange: (name: string) => void
}

export default function ReviewTable({
  data, unit, statementType,
  onDataChange, onUnitChange, onStatementTypeChange, onCompanyNameChange,
}: Props) {
  const handleValueChange = (key: keyof ExtractedData['statements'], value: string) => {
    const num = value === '' || value === '-' ? null : Number(value)
    onDataChange({ ...data, statements: { ...data.statements, [key]: num } })
  }

  const groups = [...new Set(FIELDS.map(f => f.group))]

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">基本情報</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">企業名</label>
            <input type="text" value={data.companyName} onChange={e => onCompanyNameChange(e.target.value)} placeholder="例：トヨタ自動車株式会社" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">会計年度</label>
            <input type="number" value={data.fiscalYear} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">種別</label>
            <select value={statementType} onChange={e => onStatementTypeChange(e.target.value as '連結' | '個別')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
              <option value="連結">連結</option>
              <option value="個別">個別（単体）</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">単位</label>
            <select value={unit} onChange={e => onUnitChange(e.target.value as FinancialStatement['unit'])} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
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

      {groups.map(group => (
        <div key={group} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">{group}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal w-32">項目</th>
                <th className="text-right px-4 py-2 text-xs text-gray-400 font-normal">抽出値</th>
                <th className="text-right px-4 py-2 text-xs text-gray-400 font-normal w-12">精度</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.filter(f => f.group === group).map(field => {
                const val = data.statements[field.key]
                const conf = (data.confidence as Record<string, string>)[field.key] as 'high' | 'medium' | 'low' | undefined
                const confConfig = conf ? CONFIDENCE_CONFIG[conf] : null
                return (
                  <tr key={field.key} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-700">{field.label}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={val ?? ''}
                          onChange={e => handleValueChange(field.key, e.target.value)}
                          placeholder="未取得"
                          step={field.isPercent ? '0.01' : '1'}
                          className={`w-36 text-right border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400 ${val === null ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300 text-gray-900'}`}
                        />
                        <span className="text-xs text-gray-400 w-10">{field.isPercent ? '%' : unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {confConfig && <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${confConfig.className}`}>{confConfig.label}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
        AIによる抽出結果です。必ず原資料と照合し、誤りがあれば修正してください。
      </div>
    </div>
  )
}
