import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('analysis_projects')
      .insert({
        company_name: 'テスト株式会社',
        fiscal_year_start: 2024,
        fiscal_year_end: 2024,
        memo: '',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) })
  }
}
