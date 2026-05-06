'use client'

interface Props {
  step: 'reading' | 'extracting' | 'analyzing' | 'rendering' | null
  progress: number
}

const STEPS = [
  { key: 'reading',    label: 'PDF読み込み', icon: '📂' },
  { key: 'extracting', label: '数値抽出',     icon: '🔍' },
  { key: 'analyzing',  label: 'AI解析',       icon: '🤖' },
  { key: 'rendering',  label: 'グラフ作成',   icon: '📊' },
]

export default function AnalyzingOverlay({ step, progress }: Props) {
  if (!step) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
          <span className="text-white text-sm">◎</span>
        </div>
        <p className="text-sm font-medium text-gray-800">
          {STEPS.find(s => s.key === step)?.label ?? '処理中...'}
        </p>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map(s => {
          const currentIndex = STEPS.findIndex(x => x.key === step)
          const thisIndex = STEPS.findIndex(x => x.key === s.key)
          const isDone = thisIndex < currentIndex
          const isActive = thisIndex === currentIndex
          return (
            <div key={s.key} className={`text-center p-2 rounded-lg text-xs ${isActive ? 'bg-blue-50 text-blue-700' : ''} ${isDone ? 'text-green-600' : ''} ${!isActive && !isDone ? 'text-gray-300' : ''}`}>
              <div className="text-xl mb-1">{isDone ? '✓' : s.icon}</div>
              <div className="leading-tight">{s.label}</div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 text-center mt-4">PDFのページ数によって数十秒かかる場合があります</p>
    </div>
  )
}
