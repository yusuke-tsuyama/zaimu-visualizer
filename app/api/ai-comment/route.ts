import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { FinancialStatement } from '@/lib/types'
import { CLAUDE_MODEL } from '@/lib/constants'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const COMMENT_SYSTEM = `あなたは財務分析の学習補助を行うアシスタントです。
投資助言・売買推奨を絶対に行わないでください。
財務数値の傾向を客観的に説明する学習補助コメントのみ行い、
必ず指定のJSON形式のみで返してください。`

export async function POST(req: NextRequest) {

  try {
    const { statements, companyName } = await req.json() as {
      statements: FinancialStatement[]
      companyName: string
    }
    if (!statements || statements.length === 0) {
      return NextResponse.json({ error: 'データがありません' }, { status: 400 })
    }
    const latest = statements[statements.length - 1] as Record<string, unknown>
    const oldest = statements[0] as Record<string, unknown>
    const dataText = `企業名: ${companyName}
分析期間: ${oldest.fiscalYear}年〜${latest.fiscalYear}年
売上高: ${latest.revenue ?? 'N/A'}
営業利益: ${latest.operatingProfit ?? 'N/A'}
当期純利益: ${latest.netIncome ?? 'N/A'}
総資産: ${latest.totalAssets ?? 'N/A'}
純資産: ${latest.netAssets ?? 'N/A'}
自己資本比率: ${latest.equityRatio ?? 'N/A'}%
営業CF: ${latest.operatingCF ?? 'N/A'}
ROE: ${latest.roe ?? 'N/A'}%
ROA: ${latest.roa ?? 'N/A'}%`

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: COMMENT_SYSTEM,
      messages: [{
        role: 'user',
        content: `以下の財務データについて学習補助コメントをJSON形式で返してください。\n\n${dataText}\n\n{"summary":"総合コメント","growthComment":"売上成長","profitabilityComment":"収益性","safetyComment":"財務安全性","cashflowComment":"キャッシュ創出力","investmentComment":"投資姿勢","riskComment":"注目ポイント"}`,
      }],
    })

    const raw = (message.content as Array<{type: string; text?: string}>)
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('')

    const jsonMatch = raw.match(/\{[\s\S]+\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'コメント取得失敗' }, { status: 502 })
    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) })
  } catch (err) {
    return NextResponse.json({ error: 'AIコメント生成に失敗しました', detail: String(err) }, { status: 500 })
  }
}
