'use client'

import { UploadedFile } from '@/lib/types'

interface Props {
  files: UploadedFile[]
  onYearChange: (index: number, year: number) => void
  onRemove: (index: number) => void
}

const STATUS_LABELS = {
  pending:    { label: '待機中',    color: 'bg-gray-100 text-gray-600' },
  extracting: { label: '抽出中...', color: 'bg-yellow-100 text-yellow-700' },
  done:       { label: '完了',      color: 'bg-green-100 text-green-700' },
  error:      { label: 'エラー',    color: 'bg-red-100 text-red-600' },
}

export default function FileList({ files, onYearChange, onRemove }: Props) {
  if (files.length === 0) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">アップロード済み（{files.length}件）</span>
        <span className="text-xs text-gray-400">年度を確認・修正してください</span>
      </div>
      {files.map((uf, index) => {
        const status = STATUS_LABELS[uf.status]
        return (
          <div key={index} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
            <span className="text-lg">📄</span>
            <span className="flex-1 text-sm text-gray-800 truncate">{uf.file.name}</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={uf.fiscalYear ?? ''}
                onChange={e => onYearChange(index, parseInt(e.target.value))}
                placeholder="年度"
                min={2000}
                max={2035}
                className="w-20 text-sm text-center border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400" inputMode="numeric" pattern="[0-9]*"
              />
              <span className="text-xs text-gray-400">年</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
            <button onClick={() => onRemove(index)} className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        )
      })}
    </div>
  )
}
