cat > app/api/ai-comment/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { FinancialStatement } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const COMMENT_SYSTEM = `あなたは財務分析の学習補助を行うアシスタントです。
以下のルールを厳守してください：
- 投資助言・売買推奨を絶対に行わない
- 「買い」「売り」「投資すべき」「割安」「割高」などの表現を使わない
- 「優良企業」「危険企業」などの断定ラベルを使わない
- 財務数値の傾向・特徴を客観的に説明する学習補助コメントのみ行う
- 各コメントは2〜3文、日本語で記述する
- 必ず指定のJSON形式のみで返す（説明文・マークダウン不可）`

export async function POST(req: NextRequest) {
  try {
    const { statements, companyName } = await req.json() as {
      statements: FinancialStatement[]
      companyName: string
    }

    if (!statements || statements.length === 0) {
      return NextResponse.json({ error: 'データがありません' }, { status: 400 })
    }

    const latest = statements[statements.length - 1]
    const oldest = statements[0]
    const years = statements.length

    const dataText = `
企業名: ${companyName}
分析期間: ${oldest.fiscalYear}年〜${latest.fiscalYear}年（${years}期分）
単位: ${latest.unit}

直近期（${latest.fiscalYear}年）:
- 売上高: ${latest.revenue ?? 'N/A'}
- 営業利益: ${latest.operatingProfit ?? 'N/A'}
- 当期純利益: ${latest.netIncome ?? 'N/A'}
- 営業利益率: ${latest.operatingMargin ?? 'N/A'}%
- 総資産: ${latest.totalAssets ?? 'N/A'}
- 純資産: ${latest.netAssets ?? 'N/A'}
- 自己資本比率: ${latest.equityRatio ?? 'N/A'}%
- 営業CF: ${latest.operatingCF ?? 'N/A'}
- 投資CF: ${latest.investingCF ?? 'N/A'}
- フリーCF: ${latest.freeCF ?? 'N/A'}
- ROE: ${latest.roe ?? 'N/A'}%
- ROA: ${latest.roa ?? 'N/A'}%

期首（${oldest.fiscalYear}年）:
- 売上高: ${oldest.revenue ?? 'N/A'}
- 営業利益: ${oldest.operatingProfit ?? 'N/A'}
- 総資産: ${oldest.totalAssets ?? 'N/A'}
`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      system: COMMENT_SYSTEM,
      messages: [{
        role: 'user',
        content: `以下の財務データについて、学習補助コメントをJSON形式で返してください。

${dataText}

返すJSON:
{
  "summary": "総合コメント（3文以内）",
  "growthComment": "売上成長についてのコメント",
  "profitabilityComment": "収益性についてのコメント",
  "safetyComment": "財務安全性についてのコメント",
  "cashflowComment": "キャッシュ創出力についてのコメント",
  "investmentComment": "投資姿勢についてのコメント",
  "riskComment": "注目すべき財務リスク要因についてのコメント"
}`,
      }],
    })

    const raw = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch = raw.match(/\{[\s\S]+\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'コメント取得失敗', raw }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) })
  } catch (err) {
    return NextResponse.json(
      { error: 'AIコメント生成に失敗しました', detail: String(err) },
      { status: 500 }
    )
  }
}
EOF
