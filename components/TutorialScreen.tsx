'use client'

const STEPS = [
  { num: 1, icon: '📄', title: 'PDFをアップロード', desc: '決算書・有価証券報告書・決算短信等のPDFをドラッグ&ドロップ。最大10年分対応。' },
  { num: 2, icon: '🔍', title: '財務数値を自動抽出', desc: 'AIが主要な財務数値を自動抽出。売上・利益・資産・CF等を解析します。' },
  { num: 3, icon: '✅', title: '数値を確認・修正', desc: '抽出結果を確認し、誤りがあれば修正できます。単位（百万円等）も設定可能。' },
  { num: 4, icon: '📊', title: '財務三表のつながりを確認', desc: 'P/L・B/S・C/Fを横断表示。10年推移グラフで変化をひと目で確認。' },
  { num: 5, icon: '💾', title: '保存・再表示', desc: '分析結果を保存して、いつでも再表示・比較が可能です。' },
]

interface Props {
  onStart: () => void
  isModal?: boolean
}

export default function TutorialScreen({ onStart, isModal = false }: Props) {
  return (
    <div className={isModal ? '' : 'min-h-screen bg-gray-50 flex items-center justify-center p-6'}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-2">使い方ガイド</h2>
          <p className="text-sm text-gray-500">5ステップで財務三表を分析できます</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          {STEPS.map(step => (
            <div key={step.num} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center mx-auto mb-3">
                {step.num}
              </div>
              <div className="text-2xl mb-2">{step.icon}</div>
              <p className="text-xs font-medium text-gray-800 mb-1">{step.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 mb-6">
          このアプリは財務分析の学習補助を目的としています。投資判断にはご利用いただけません。
        </div>
        <button
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          はじめる →
        </button>
      </div>
    </div>
  )
}
