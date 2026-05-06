cat > app/api/analyze/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 120

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `あなたは財務諸表の読解を専門とするアシスタントです。
与えられた決算書テキストから財務数値を正確に抽出し、必ず指定のJSON形式のみで返してください。
JSON以外の文字（説明文・コメント・マークダウン記法）は一切含めないでください。

抽出ルール：
- 連結財務諸表を優先し、なければ個別（単体）を使用する
- 数値は単位変換せず、テキストに記載された数値をそのまま抽出する
- 取得できない項目は必ず null にする。推測で埋めない
- △や▲はマイナスを意味するため、負の値として返す
- 自己資本比率・ROE・ROA・営業利益率はパーセント値（例: 35.4）で返す
- フリーCFが明示されていない場合は「営業CF + 投資CF」で計算してよい
- 単位は百万円・千円・円のいずれかを判定して返す
- 会計年度は「第XX期」「XXXX年X月期」等から判断する`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { extractedText, fileName, fiscalYear, unit, statementType } = body

    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: 'テキストが短すぎます。PDFの内容を確認してください。' },
        { status: 400 }
      )
    }

    const hint = [
      fiscalYear ? `会計年度: ${fiscalYear}年` : '',
      unit ? `単位: ${unit}` : '',
      statementType ? `種別: ${statementType}` : '',
    ].filter(Boolean).join('、')

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `以下は「${fileName}」から抽出した決算書テキストです。
ヒント情報：${hint}

このテキストから財務数値を抽出し、以下のJSON形式で返してください：

{
  "companyName": "企業名",
  "fiscalYear": 2024,
  "fiscalYearLabel": "2024年3月期",
  "statementType": "連結",
  "unit": "百万円",
  "statements": {
    "revenue": null,
    "operatingProfit": null,
    "ordinaryProfit": null,
    "netIncome": null,
    "totalAssets": null,
    "totalLiabilities": null,
    "netAssets": null,
    "equityRatio": null,
    "operatingCF": null,
    "investingCF": null,
    "financingCF": null,
    "freeCF": null,
    "roe": null,
    "roa": null,
    "operatingMargin": null
  },
  "confidence": {
    "revenue": "high",
    "operatingProfit": "high",
    "ordinaryProfit": "medium",
    "netIncome": "high",
    "totalAssets": "high",
    "netAssets": "high",
    "operatingCF": "medium"
  },
  "warnings": []
}

---
決算書テキスト：
${extractedText.slice(0, 40000)}`,
      }],
    })

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const jsonMatch = rawText.match(/\{[\s\S]+\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Claude APIからJSONを取得できませんでした', raw: rawText },
        { status: 502 }
      )
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: 'JSON解析に失敗しました', raw: rawText },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: unknown) {
    console.error('analyze error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Claude API呼び出しに失敗しました', detail: message },
      { status: 500 }
    )
  }
}
EOF
