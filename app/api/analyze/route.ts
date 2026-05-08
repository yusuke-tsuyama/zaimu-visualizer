import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 120

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `あなたは財務諸表の読解を専門とするアシスタントです。
与えられた決算書テキストから財務数値を正確に抽出し、必ず指定のJSON形式のみで返してください。
JSON以外の文字は一切含めないでください。
抽出ルール：
- 連結財務諸表を優先し、なければ個別を使用する
- 数値は単位変換せず、テキストに記載された数値をそのまま抽出する
- 取得できない項目は必ず null にする。推測で埋めない
- △や▲はマイナスを意味するため、負の値として返す
- 自己資本比率・ROE・ROA・営業利益率はパーセント値で返す`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { extractedText, fileName, fiscalYear, unit, statementType, accountItems } = body

    if (!extractedText || extractedText.trim().length < 100) {
      console.warn("テキストが短いですが続行します")
    }

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

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `以下は「${fileName}」から抽出した決算書テキストです。
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
}

---
決算書テキスト：
${extractedText.slice(0, 40000)}`,
      }],
    })

    const rawText = (message.content as Array<{type: string; text?: string}>)
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('')

    const jsonMatch = rawText.match(/\{[\s\S]+\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Claude APIからJSONを取得できませんでした', raw: rawText }, { status: 502 })
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
