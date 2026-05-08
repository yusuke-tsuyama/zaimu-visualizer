'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'
import KpiCard from '@/components/dashboard/KpiCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import CfChart from '@/components/dashboard/CfChart'
import RatioChart from '@/components/dashboard/RatioChart'
import LinkageCard from '@/components/dashboard/LinkageCard'
import AiCommentCard from '@/components/dashboard/AiCommentCard'
import { FinancialStatement, AiComment } from '@/lib/types'
import { toChartData, calcDelta } from '@/lib/chartHelpers'
import { generateAiComment } from '@/lib/analyzeClient'
import { saveAnalysisProject } from '@/lib/supabaseOperations'

const KPI_KEYS: { label: string; key: string; isPercent: boolean; highlight?: boolean }[] = [
  { label: '売上高', key: 'revenue', isPercent: false, highlight: true },
  { label: '営業利益', key: 'operatingProfit', isPercent: false },
  { label: '経常利益', key: 'ordinaryProfit', isPercent: false },
  { label: '当期純利益', key: 'netIncome', isPercent: false },
  { label: '総資産', key: 'totalAssets', isPercent: false },
  { label: '純資産', key: 'netAssets', isPercent: false },
  { label: '自己資本比率', key: 'equityRatio', isPercent: true },
  { label: '営業CF', key: 'operatingCF', isPercent: false },
  { label: '投資CF', key: 'investingCF', isPercent: false },
  { label: '財務CF', key: 'financingCF', isPercent: false },
  { label: 'フリーCF', key: 'freeCF', isPercent: false },
  { label: 'ROE', key: 'roe', isPercent: true },
  { label: 'ROA', key: 'roa', isPercent: true },
  { label: '営業利益率', key: 'operatingMargin', isPercent: true },
]

export default function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statements, setStatements] = useState<FinancialStatement[]>([])
  const [companyName, setCompanyName] = useState('')
  const [unit, setUnit] = useState<string>('百万円')
  const [aiComment, setAiComment] = useState<AiComment | null>(null)
  const [generatingComment, setGeneratingComment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [memo, setMemo] = useState('')
  const [showMemo, setShowMemo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const projectId = searchParams.get('project')
    if (projectId) {
      fetchFromSupabase(projectId)
    } else {
      const stmtsJson = sessionStorage.getItem('confirmedStatements')
      const name = sessionStorage.getItem('confirmedCompanyName') ?? ''
      const u = sessionStorage.getItem('confirmedUnit') ?? '百万円'
      if (!stmtsJson) { router.push('/'); return }
      setStatements(JSON.parse(stmtsJson))
      setCompanyName(name)
      setUnit(u)
    }
  }, [router, searchParams])

  useEffect(() => {
    if (statements.length === 0 || aiComment) return
    handleGenerateComment()
  }, [statements])

  async function fetchFromSupabase(projectId: string) {
    try {
      const { fetchProjectWithComment } = await import('@/lib/supabaseOperations')
      const data = await fetchProjectWithComment(projectId)
      const stmts: FinancialStatement[] = (data.financial_statements ?? [])
        .sort((a: Record<string,unknown>, b: Record<string,unknown>) => (a.fiscal_year as number) - (b.fiscal_year as number))
        .map((s: Record<string, unknown>) => ({
          fiscalYear: s.fiscal_year as number,
          ...s,
          unit: (s.unit ?? '百万円') as FinancialStatement['unit'],
          statementType: (s.statement_type ?? '連結') as FinancialStatement['statementType'],
        }))
      setStatements(stmts)
      setCompanyName(data.company_name)
      setUnit((stmts[0] as Record<string,unknown>)?.unit as string ?? '百万円')
      setMemo(data.memo ?? '')
      setSaved(true)
      const comment = data.ai_comments?.[0]
      if (comment) {
        setAiComment({
          summary: comment.summary,
          growthComment: comment.growth_comment,
          profitabilityComment: comment.profitability_comment,
          safetyComment: comment.safety_comment,
          cashflowComment: comment.cashflow_comment,
          investmentComment: comment.investment_comment,
          riskComment: comment.risk_comment,
        })
      }
    } catch (err) {
      setError('データの読み込みに失敗しました: ' + String(err))
    }
  }

  const handleGenerateComment = useCallback(async () => {
    if (statements.length === 0) return
    setGeneratingComment(true)
    try {
      const comment = await generateAiComment(statements, companyName)
      setAiComment(comment)
    } catch (err) {
      console.warn('AIコメント生成失敗:', err)
    } finally {
      setGeneratingComment(false)
    }
  }, [statements, companyName])

  const handleSave = useCallback(async () => {
    if (saving || saved) return
    setSaving(true)
    try {
      const uploadedFiles = JSON.parse(sessionStorage.getItem('uploadedFiles') ?? '[]')
      await saveAnalysisProject({ companyName, statements, aiComment, uploadedFiles, memo })
      setSaved(true)
    } catch (err) {
      setError('保存に失敗しました: ' + String(err))
    } finally {
      setSaving(false)
    }
  }, [companyName, statements, aiComment, memo, saving, saved])

  if (statements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p className="text-sm">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  const sorted = [...statements].sort((a, b) => a.fiscalYear - b.fiscalYear)
  const latest = sorted[sorted.length - 1] as Record<string, unknown>
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] as Record<string, unknown> : null
  const chartData = toChartData(sorted)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between" style={{ background: '#0a1628' }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <h1 className="text-sm font-medium text-blue-100">{companyName || '企業名未設定'}</h1>
            <p className="text-xs text-blue-500">{sorted[0]?.fiscalYear}〜{sorted[sorted.length-1]?.fiscalYear}年 | {unit}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMemo(v => !v)} className="text-xs text-blue-300 border border-blue-700 rounded-lg px-3 py-1.5 hover:bg-blue-900 transition-colors">メモ</button>
          <button onClick={handleSave} disabled={saving || saved} className={'text-xs px-3 py-1.5 rounded-lg font-medium transition-all ' + (saved ? 'text-emerald-400 border border-emerald-700' : 'text-white bg-blue-600 hover:bg-blue-700')}>
            {saving ? '保存中...' : saved ? '✓ 保存済み' : '保存する'}
          </button>
          <button onClick={() => router.push('/history')} className="text-xs text-blue-300 border border-blue-700 rounded-lg px-3 py-1.5 hover:bg-blue-900 transition-colors">履歴</button>
        </div>
      </header>

      {showMemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3">
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="この分析についてのメモを記入..." rows={2} className="w-full text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-amber-500 resize-none" />
        </div>
      )}

      {error && <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mx-4 sm:mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800 flex items-start gap-2">
        <span>⚠</span>
        <span>AI抽出結果です。原資料と照合の上ご利用ください。投資判断にはご利用いただけません。</span>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-5">
        <section>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">直近期 KPI（{sorted[sorted.length-1]?.fiscalYear}年）</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {KPI_KEYS.map((kpi, i) => {
              const val = latest[kpi.key] as number | null
              const prevVal = previous ? previous[kpi.key] as number | null : null
              const delta = calcDelta(val, prevVal)
              return <KpiCard key={i} label={kpi.label} value={val} unit={unit} isPercent={kpi.isPercent} deltaValue={delta.value} deltaSign={delta.sign} highlight={kpi.highlight} />
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">売上高・営業利益・純利益 推移</h3>
            <RevenueChart data={chartData} unit={unit} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">キャッシュフロー推移</h3>
            <CfChart data={chartData} unit={unit} />
          </div>
        </section>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ROE / ROA / 営業利益率 / 自己資本比率 推移</h3>
          <RatioChart data={chartData} />
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">財務三表のつながり（{sorted[sorted.length-1]?.fiscalYear}年）</h3>
          <LinkageCard latest={sorted[sorted.length - 1]} previous={sorted.length >= 2 ? sorted[sorted.length - 2] : null} />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">AIコメント（学習補助）</h3>
            <button onClick={handleGenerateComment} disabled={generatingComment} className="text-xs text-blue-600 border border-blue-300 rounded-lg px-3 py-1 hover:bg-blue-50 transition-colors disabled:opacity-40">
              {generatingComment ? '生成中...' : '再生成'}
            </button>
          </div>
          <AiCommentCard
            comment={aiComment ?? { summary: '', growthComment: '', profitabilityComment: '', safetyComment: '', cashflowComment: '', investmentComment: '', riskComment: '' }}
            generating={generatingComment || !aiComment}
          />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">財務データ一覧</h3>
            <span className="text-xs text-gray-400">{unit}単位</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-gray-500 font-medium sticky left-0 bg-gray-50">項目</th>
                  {sorted.map(s => <th key={s.fiscalYear} className="text-right px-3 py-2 text-gray-500 font-medium whitespace-nowrap">{s.fiscalYear}年</th>)}
                </tr>
              </thead>
              <tbody>
                {KPI_KEYS.map((kpi, i) => (
                  <tr key={kpi.key} className={'border-b border-gray-50 ' + (i % 2 === 0 ? '' : 'bg-gray-50/50')}>
                    <td className="px-3 py-2 text-gray-600 sticky left-0 bg-inherit font-medium whitespace-nowrap">{kpi.label}</td>
                    {sorted.map(s => {
                      const v = (s as Record<string,unknown>)[kpi.key] as number | null
                      return (
                        <td key={s.fiscalYear} className={'px-3 py-2 text-right tabular-nums ' + (v === null ? 'text-gray-300' : v < 0 ? 'text-red-600' : 'text-gray-800')}>
                          {v === null ? '—' : kpi.isPercent ? v.toFixed(1) + '%' : v.toLocaleString()}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="h-8" />
      </main>
    </div>
  )
}
