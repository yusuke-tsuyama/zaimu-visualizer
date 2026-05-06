cat > app/api/extract-pdf/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDFファイルのみ対応しています' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは50MB以下にしてください' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ''

    try {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer, { max: 30 })
      extractedText = data.text
    } catch (parseError) {
      console.error('pdf-parse error:', parseError)
      extractedText = ''
    }

    const fileName = file.name
    const yearMatch = fileName.match(/20([12]\d)/)
    const estimatedYear = yearMatch ? parseInt(yearMatch[0]) : null

    let unit: '百万円' | '千円' | '円' = '百万円'
    if (extractedText.includes('百万円')) unit = '百万円'
    else if (extractedText.includes('千円')) unit = '千円'
    else if (extractedText.includes('（円）') || extractedText.includes('(円)')) unit = '円'

    const consolidatedCount = (extractedText.match(/連結/g) || []).length
    const separateCount = (extractedText.match(/個別|単体/g) || []).length
    const statementType = consolidatedCount >= separateCount ? '連結' : '個別'

    const truncatedText = extractedText.slice(0, 50000)

    return NextResponse.json({
      success: true,
      fileName,
      estimatedYear,
      unit,
      statementType,
      textLength: extractedText.length,
      truncated: extractedText.length > 50000,
      extractedText: truncatedText,
    })
  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json(
      { error: 'PDF抽出中にエラーが発生しました', detail: String(error) },
      { status: 500 }
    )
  }
}
EOF
