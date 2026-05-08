import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDFファイルのみ対応しています' }, { status: 400 })
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'ファイルサイズは50MB以下にしてください' }, { status: 400 })

    const fileName = file.name

    // pdf-parseの代わりにPDF.jsをWeb APIとして使用
    // Vercel環境ではpdf-parseが動作しないため、
    // ファイルをbase64に変換してClaudeに直接渡す方式に変更
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // ファイル名から年度推定
    const yearMatch = fileName.match(/20([12]\d)/)
    const estimatedYear = yearMatch ? parseInt(yearMatch[0]) : null

    return NextResponse.json({
      success: true,
      fileName,
      estimatedYear,
      unit: '百万円',
      statementType: '連結',
      textLength: arrayBuffer.byteLength,
      truncated: false,
      extractedText: '',
      base64Pdf: base64,
      usePdfVision: true,
    })
  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json({ error: 'PDF処理中にエラーが発生しました', detail: String(error) }, { status: 500 })
  }
}
