import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { DocumentBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { CLAUDE_MODEL } from '@/lib/constants'
import { getAdminClient } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 120

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `あなたは財務諸表の読解を専門とするアシスタントです。
与えられた決算書から財務数値を正確に抽出し、必ず指定のJSON形式のみで返してください。
JSON以外の文字は一切含めないでください。
抽出ルール：
- 連結財務諸表を優先し、なければ個別を使用する
- 数値は単位変換せず、記載された数値をそのまま抽出する
- 取得できない項目は必ず null にする。推測で埋めない
- △や▲はマイナスを意味するため、負の値として返す
- 自己資本比率・ROE・ROA・営業利益率はパーセント値で返す
- フリーCFが明示されていない場合は営業CF+投資CFで計算してよい
- 単位は百万円・千円・万円・円のいずれかを判定して返す`

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const today = new Date().toISOString().slice(0, 10)
  try {
    const supabase = getAdminClient()
    const { data: rateRecord } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .maybeSingle()

    if (rateRecord && rateRecord.count >= 30) {
      return NextResponse.json(
        { error: '本日の利用上限に達しました。明日また試してください。' },
        { status: 429 }
      )
    }

    if (rateRecord) {
      await supabase
        .from('rate_limits')
        .update({ count: rateRecord.count + 1 })
        .eq('ip_address', ip)
        .eq('date', today)
    } else {
      await supabase
        .from('rate_limits')
        .insert({ ip_address: ip, date: today, count: 1 })
    }
  } catch {
    // レート制限エラーは無視して分析を続行
  }

  try {
    const body = await req.json()
    const { extractedText, fileName, fiscalYear, unit, statementType, accountItems, base64Pdf } = body

    const hint = [
      fiscalYear ? `会計年度: ${fiscalYear}年` : '',
      unit ? `単位: ${unit}` : '',
      statementType ? `種別: ${statementType}` : '',
    ].filter(Boolean).join('、')

    const itemsToExtract = accountItems && accountItems.length > 0
      ? accountItems
      : [
          { id: 'revenue', label: '売上高' },
          { id: 'operatingProfit', label: '営業利益' },
          { id: 'ordinaryProfit', label: '経常利益' },
          { id: 'netIncome', label: '当期純利益' },
          { id: 'totalAssets', label: '資産合計' },
          { id: 'totalLiabilities', label: '負債合計' },
          { id: 'netAssets', label: '純資産合計' },
          { id: 'equityRatio', label: '自己資本比率' },
          { id: 'operatingCF', label: '営業活動によるキャッシュフロー' },
          { id: 'investingCF', label: '投資活動によるキャッシュフロー' },
          { id: 'financingCF', label: '財務活動によるキャッシュフロー' },
          { id: 'freeCF', label: 'フリーキャッシュフロー' },
          { id: 'roe', label: 'ROE' },
          { id: 'roa', label: 'ROA' },
          { id: 'operatingMargin', label: '営業利益率' },
        ]

    const statementsTemplate = itemsToExtract
      .map((item: { id: string; label: string }) => `    "${item.id}": null`)
      .join(',\n')

    const userPrompt = `ファイル名：${fileName}
ヒント情報：${hint}

以下のJSON形式で財務数値を抽出してください：

{
  "companyName": "企業名",
  "fiscalYear": ${fiscalYear ?? 2024},
  "statementType": "連結",
  "unit": "${unit ?? '百万円'}",
  "statements": {
${statementsTemplate}
  },
  "confidence": {},
  "warnings": []
}`

    let message

    if (base64Pdf) {
      const docBlock: DocumentBlockParam = {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Pdf,
        },
      }
      const textBlock: TextBlockParam = {
        type: 'text',
        text: userPrompt,
      }
      message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [docBlock, textBlock],
        }],
      })
    } else {
      message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: userPrompt + '\n\n---\n決算書テキスト：\n' + (extractedText ?? '').slice(0, 40000),
        }],
      })
    }

    const rawText = (message.content as Array<{type: string; text?: string}>)
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('')

    const jsonMatch = rawText.match(/\{[\s\S]+\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'JSONを取得できませんでした', raw: rawText }, { status: 502 })
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'JSON解析に失敗しました', raw: rawText }, { status: 502 })
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Claude API呼び出しに失敗しました', detail: message }, { status: 500 })
  }
}
