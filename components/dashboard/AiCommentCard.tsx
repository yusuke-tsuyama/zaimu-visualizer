import { AiComment } from '@/lib/types'

interface Props {
  comment: AiComment
  generating?: boolean
}

const SECTIONS: { key: keyof AiComment; label: string; icon: string }[] = [
  { key: 'growthComment', label: '売上成長', icon: '📈' },
  { key: 'profitabilityComment', label: '収益性', icon: '💹' },
  { key: 'safetyComment', label: '財務安全性', icon: '🛡' },
  { key: 'cashflowComment', label: 'キャッシュ創出力', icon: '💧' },
  { key: 'investmentComment', label: '投資姿勢', icon: '🏗' },
  { key: 'riskComment', label: '注目ポイント', icon: '🔍' },
]

export default function AiCommentCard({ comment, generating }: Props) {
  if (generating) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <div className="text-3xl mb-3 animate-pulse">🤖</div>
        AIコメントを生成中...
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-700 mb-1">総合コメント</p>
        <p className="text-sm text-blue-900 leading-relaxed">{comment.summary}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map(sec => (
          <div key={sec.key} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{sec.icon}</span>
              <span className="text-xs font-medium text-gray-700">{sec.label}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{comment[sec.key] as string}</p>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 text-center pt-1">
        Claude AIによる学習補助コメントです。投資助言・売買推奨ではありません。
      </div>
    </div>
  )
}
