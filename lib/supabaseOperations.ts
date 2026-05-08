'use client'

import { createBrowserClient } from '@supabase/ssr'
import { FinancialStatement, AiComment, AnalysisProject } from './types'

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function saveAnalysisProject({
  companyName, statements, aiComment, uploadedFiles, memo = '',
}: {
  companyName: string
  statements: FinancialStatement[]
  aiComment: AiComment | null
  uploadedFiles: { name: string; fiscalYear: number }[]
  memo?: string
}): Promise<string> {
  const supabase = getClient()
  const years = statements.map(s => s.fiscalYear).filter(Boolean)
  const fiscalYearStart = Math.min(...years)
  const fiscalYearEnd = Math.max(...years)

  const { data: project, error: projErr } = await supabase
    .from('analysis_projects')
    .insert({
      company_name: companyName,
      fiscal_year_start: fiscalYearStart,
      fiscal_year_end: fiscalYearEnd,
      memo,
    })
    .select()
    .single()

  if (projErr) throw new Error(projErr.message)

  const projectId = project.id

  const stmtRows = statements.map(s => {
    const row: Record<string, unknown> = {
      project_id: projectId,
      fiscal_year: s.fiscalYear,
      unit: s.unit,
      statement_type: s.statementType,
      source_file_name: s.sourceFileName ?? null,
    }
    const data = s as Record<string, unknown>
    const keys = ['revenue','operatingProfit','ordinaryProfit','netIncome','totalAssets','totalLiabilities','netAssets','equityRatio','operatingCF','investingCF','financingCF','freeCF','roe','roa','operatingMargin']
    const dbKeys = ['revenue','operating_profit','ordinary_profit','net_income','total_assets','total_liabilities','net_assets','equity_ratio','operating_cf','investing_cf','financing_cf','free_cf','roe','roa','operating_margin']
    keys.forEach((k, i) => {
      const val = data[k]
      row[dbKeys[i]] = (val !== undefined && val !== null) ? Number(val) : null
    })
    return row
  })

  const { error: stmtErr } = await supabase.from('financial_statements').insert(stmtRows)
  if (stmtErr) throw new Error(stmtErr.message)

  if (aiComment) {
    await supabase.from('ai_comments').insert({
      project_id: projectId,
      summary: aiComment.summary,
      growth_comment: aiComment.growthComment,
      profitability_comment: aiComment.profitabilityComment,
      safety_comment: aiComment.safetyComment,
      cashflow_comment: aiComment.cashflowComment,
      investment_comment: aiComment.investmentComment,
      risk_comment: aiComment.riskComment,
    })
  }

  if (uploadedFiles.length > 0) {
    await supabase.from('uploaded_files').insert(
      uploadedFiles.map(f => ({
        project_id: projectId,
        file_name: f.name,
        fiscal_year: f.fiscalYear,
      }))
    )
  }

  return projectId
}

export async function fetchProjects(): Promise<AnalysisProject[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('analysis_projects')
    .select('id, company_name, fiscal_year_start, fiscal_year_end, memo, created_at, financial_statements (*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(p => ({
    id: p.id,
    companyName: p.company_name,
    fiscalYearStart: p.fiscal_year_start,
    fiscalYearEnd: p.fiscal_year_end,
    memo: p.memo ?? '',
    createdAt: p.created_at,
    statements: (p.financial_statements ?? [])
      .sort((a: Record<string,unknown>, b: Record<string,unknown>) => (a.fiscal_year as number) - (b.fiscal_year as number))
      .map((s: Record<string, unknown>) => ({
        fiscalYear: s.fiscal_year as number,
        revenue: s.revenue as number | null,
        operatingProfit: s.operating_profit as number | null,
        ordinaryProfit: s.ordinary_profit as number | null,
        netIncome: s.net_income as number | null,
        totalAssets: s.total_assets as number | null,
        totalLiabilities: s.total_liabilities as number | null,
        netAssets: s.net_assets as number | null,
        equityRatio: s.equity_ratio as number | null,
        operatingCF: s.operating_cf as number | null,
        investingCF: s.investing_cf as number | null,
        financingCF: s.financing_cf as number | null,
        freeCF: s.free_cf as number | null,
        roe: s.roe as number | null,
        roa: s.roa as number | null,
        operatingMargin: s.operating_margin as number | null,
        unit: (s.unit ?? '百万円') as FinancialStatement['unit'],
        statementType: (s.statement_type ?? '連結') as FinancialStatement['statementType'],
        sourceFileName: s.source_file_name as string | undefined,
      })),
  }))
}

export async function fetchProjectWithComment(projectId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('analysis_projects')
    .select('id, company_name, fiscal_year_start, fiscal_year_end, memo, created_at, financial_statements (*), ai_comments (*)')
    .eq('id', projectId)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteProject(projectId: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from('analysis_projects')
    .delete()
    .eq('id', projectId)
  if (error) throw new Error(error.message)
}

export async function updateProjectMemo(projectId: string, memo: string) {
  const supabase = getClient()
  const { error } = await supabase
    .from('analysis_projects')
    .update({ memo, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw new Error(error.message)
}
