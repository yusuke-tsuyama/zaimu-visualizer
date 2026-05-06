'use client'

import Logo from './Logo'

interface Props {
  onAgree: () => void
}

const TERMS = [
  'このアプリは投資助言ではありません。財務分析の学習・研究目的でご利用ください。',
  'PDF解析結果には誤りが含まれる可能性があります。抽出値は必ずご自身でご確認ください。',
  '最終的な判断は必ず原資料（有価証券報告書等）をご確認ください。',
  '著作権のある資料は、ユーザー自身が正当な権利を持つ範囲でご利用ください。',
  '合同会社リベルダードは分析結果の正確性・完全性を保証しません。',
]

export default function TermsScreen({ onAgree }: Props) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Logo size={40} />
          <div>
            <h1 className="text-xl font-medium text-gray-900">利用規約への同意</h1>
            <p className="text-sm text-gray-500">ご利用前に必ずお読みください</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          {TERMS.map((term, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
              <span className="text-blue-500 text-sm mt-0.5">◆</span>
              <p className="text-sm text-gray-700 leading-relaxed">{term}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onAgree}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          上記に同意してはじめる
        </button>
        <p className="text-xs text-center text-gray-400 mt-3">
          同意しない場合はアプリを終了してください
        </p>
      </div>
    </div>
  )
}
