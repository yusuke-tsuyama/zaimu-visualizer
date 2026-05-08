interface Props {
  label: string
  value: number | null | undefined
  unit: string
  isPercent?: boolean
  deltaValue?: number | null
  deltaSign?: 'up' | 'down' | 'flat'
  highlight?: boolean
}

export default function KpiCard({ label, value, unit, isPercent = false, deltaValue, deltaSign, highlight = false }: Props) {
  const num = value === null || value === undefined ? null : Number(value)
  const display = num === null || isNaN(num) ? '—'
    : isPercent ? num.toFixed(1)
    : num.toLocaleString()
  const unitLabel = num === null || isNaN(num) ? ''
    : isPercent ? '%'
    : unit
  const deltaColor = deltaSign === 'up' ? 'text-emerald-600' : deltaSign === 'down' ? 'text-red-500' : 'text-gray-400'
  const deltaPrefix = deltaSign === 'up' ? '▲' : deltaSign === 'down' ? '▼' : ''
  return (
    <div className={'rounded-xl p-4 border ' + (highlight ? 'bg-blue-600 border-blue-700' : 'bg-white border-gray-200')}>
      <p className={'text-xs mb-2 ' + (highlight ? 'text-blue-200' : 'text-gray-500')}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={'text-xl font-medium ' + (highlight ? 'text-white' : 'text-gray-900')}>{display}</span>
        {unitLabel && <span className={'text-xs ' + (highlight ? 'text-blue-200' : 'text-gray-400')}>{unitLabel}</span>}
      </div>
      {deltaValue !== null && deltaValue !== undefined && (
        <p className={'text-xs mt-1 ' + deltaColor}>{deltaPrefix} {Math.abs(deltaValue).toFixed(1)}%</p>
      )}
    </div>
  )
}
