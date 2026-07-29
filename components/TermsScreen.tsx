'use client'

import { useState } from 'react'
import Logo from './Logo'

interface Props {
  onAgree: () => void
}

const TERMS = [
  'このアプリは投資助言ではありません。財務分析の学習・研究目的でご利用ください。',
  'PDF解析結果には誤りが含まれる可能性があります。抽出値は必ずご自身でご確認ください。',
  '最終的な判断は必ず原資料（有価証券報告書等）をご確認ください。',
  '著作権のある資料は、ユーザー自身が正当な権利を持つ範囲でご利用ください。',
  'サーバー負荷軽減のため、1日に分析できるのは合計15期分までです。',
  '合同会社リベルダードは分析結果の正確性・完全性を保証しません。',
]

const FULL_TERMS = [
  {
    heading: '第1条（サービスの目的）',
    body:
      '本サービスは、ユーザーがアップロードした決算書等のPDFをもとに、財務諸表に含まれる数値を抽出・可視化し、財務分析の学習および研究を支援することを目的とします。\n本サービスは投資助言を目的とするものではなく、特定の企業や有価証券の価値、安全性、投資適格性等を保証・推奨・断定するものではありません。',
  },
  {
    heading: '第2条（提供内容）',
    body:
      '本サービスは以下の機能を提供します。\n・アップロードされたPDFからの財務数値の抽出。\n・抽出した数値の集計、比率算出、およびグラフによる可視化。\n・上記に基づく学習補助を目的とした説明・コメントの生成。\nこれらの情報は学習・参考を目的としたものであり、正確性・完全性・最新性を保証するものではありません。財務数値の抽出はAIによって行われるため、誤りが含まれる可能性があります。',
  },
  {
    heading: '第3条（利用条件）',
    body:
      '・財務分析の学習・研究等の目的で利用すること。\n・アップロードするPDFについて、ユーザー自身が正当に取得し、利用する権利を有する資料を使用すること。\n・サーバー負荷軽減のため、分析回数には制限を設けており、1日に分析できるのは合計15期分までとします。\n・法令および公序良俗に反しない範囲で利用すること。',
  },
  {
    heading: '第4条（禁止事項）',
    body:
      '・本サービスの出力結果を、第三者に対し正確な財務情報であるかのように公開、転載、配布する行為。\n・本サービスを投資勧誘、営業活動、誹謗中傷等に利用する行為。\n・他者の著作権その他の権利を侵害する資料をアップロードする行為。\n・本サービスの運営を妨げる行為、および利用制限を回避する行為。',
  },
  {
    heading: '第5条（免責事項）',
    body:
      '本サービスは、提供する情報および分析結果の正確性、完全性、有用性について一切の保証を行いません。\n財務数値の抽出誤り、算出結果の誤差、AIが生成したコメントの内容等により生じたいかなる損害についても、運営者は責任を負いません。\n本サービスの情報を投資その他の判断に用いた結果について、運営者は一切の責任を負いません。最終的な判断は、原資料（有価証券報告書等）の確認を含め、ユーザー自身の責任において行うものとします。',
  },
  {
    heading: '第6条（データの取り扱い）',
    body:
      '・アップロードされたPDFは財務数値の抽出処理にのみ使用され、処理後にサーバーへ保存されることはありません。\n・保存される情報は、抽出された財務数値および分析結果のテキストデータに限られます。\n・保存された分析結果は、ユーザーが削除操作を行うまで保存されます。ユーザーは本サービス上の操作により、いつでも自身の分析結果を削除できます。\n・財務数値の抽出処理には、Anthropic社が提供するAI（Claude）を利用しています。\n・機密情報を含むPDFのアップロードは、ユーザー自身の判断と責任において行うものとします。',
  },
  {
    heading: '第7条（準拠法・管轄）',
    body: '本規約は日本法に準拠します。',
  },
  {
    heading: '第8条（お問い合わせ）',
    body:
      '本規約に関するお問い合わせは下記までご連絡ください。\n合同会社リベルダード\nメール：info@liberdade.sakura.ne.jp',
  },
]

export default function TermsScreen({ onAgree }: Props) {
  const [showFull, setShowFull] = useState(false)

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

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
          {TERMS.map((term, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
              <span className="text-blue-500 text-sm mt-0.5">◆</span>
              <p className="text-sm text-gray-700 leading-relaxed">{term}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowFull(v => !v)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 mb-4 underline"
        >
          {showFull ? '利用規約の全文を閉じる' : '利用規約の全文を読む'}
        </button>

        {showFull && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-h-96 overflow-y-auto">
            <p className="text-sm font-medium text-gray-900 mb-1">利用規約</p>
            <p className="text-xs text-gray-500 mb-4">
              財務三表ビジュアライザー / provided by 合同会社リベルダード
            </p>
            {FULL_TERMS.map((sec, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <p className="text-sm font-medium text-gray-800 mb-1">{sec.heading}</p>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-4">最終更新日：2026年7月29日</p>
          </div>
        )}

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
