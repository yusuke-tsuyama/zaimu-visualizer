'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import ReviewTable from '@/components/ReviewTable'
import { ExtractedData, FinancialStatement } from '@/lib/types'

function emptyStatements() {
  return {
    revenue: null, operatingProfit: null, ordinaryProfit: null,
    netIncome: null, totalAssets: null, totalLiabilities: null,
    netAssets: null, equityRatio: null, operatingCF: null,
    investingCF: null, financingCF: null, freeCF: null,
    roe: null, roa: null, operatingMargin: null,
  }
}

type ReviewEntry = {
  uploadedFile: { name: string; fiscalYear: number }
  extractedData: ExtractedData
  unit: FinancialStatement['unit']
  statementType: FinancialStatement['statementType']
  analyzing: boolean
  error: string | null
}

export default function ReviewPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<ReviewEntry[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [globalCompanyName, setGlobalCompanyName] = useState('')

  useEffect(() => {
    const filesJson = sessionStorage.getItem('uploadedFiles')
    if (!filesJson) { router.push('/'); return }
    const uploadedFiles: { name: string; fiscalYear: number }[] = JSON.parse(filesJson)
    const resultsJson = sessionStorage.getItem('extractedResults')
    const results: ExtractedData[] = resultsJson ? JSON.parse(resultsJson) : []

    const initial: ReviewEntry[] = uploadedFiles.map((f, i) => ({
      uploadedFile: f,
      extractedData: results[i] ?? {
        companyName: '', fiscalYear: f.fiscalYear,
        statements: emptyStatements(),
        confidence: { revenue: 'low', operatingProfit: 'low', netIncome: 'low' },
        warnings: [], rawText: '',
      },
      unit: '百万円',
      statementType: '連結',
      analyzing: false,
      error: null,
    }))
    setEntries(initial)

    const firstName = results[0]?.companyName
    if (firstName) setGlobalCompanyName(firstName)
  }, [router])

  const updateEntry = (index: number, updated: Partial<ReviewEntry>) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, ...updated } : e))
  }

  const handleSaveAndProceed = useCallback(async () => {
    const companyName = globalCompanyName.trim() || '企業名未設定'
    setSaving(true)
    const statements: FinancialStatement[] = entries.map(entry => ({
      fiscalYear: entry.extractedData.fiscalYear,
      ...entry.extractedData.statements,
      unit: entry.unit,
      statementType: entry.statementType,
      sourceFileName: entry.uploadedFile.name,
    }))
    sessionStorage.setItem('confirmedStatements', JSON.stringify(statements))
    sessionStorage.setItem('confirmedCompanyName', companyName)
    sessionStorage.setItem('confirmedUnit', entries[0]?.unit ?? '百万円')
    setSaving(false)
    router.push('/dashboard')
  }, [entries, globalCompanyName, router])

  const current = entries[activeIndex]

  if (entries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-sm">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between" style={{ background: '#0a1628' }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <h1 className="text-sm font-medium text-blue-100">抽出結果の確認・修正</h1>
            <p className="text-xs text-blue-500">原資料と照合し、誤りを修正してください</p>
          </div>
        </div>
        <button
          onClick={handleSaveAndProceed}
          disabled={saving}
          className="text-sm px-4 py-2 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          {saving ? '保存中...' : 'ダッシュボードへ →'}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="text-xs text-gray-500 block mb-1">企業名（全年度共通）</label>
          <input
            type="text"
            value={globalCompanyName}
            onChange={e => setGlobalCompanyName(e.target.value)}
            placeholder="例：トヨタ自動車株式会社"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {entries.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {entries.map((entry, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${i === activeIndex ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {entry.extractedData.fiscalYear}年
              </button>
            ))}
          </div>
        )}

        {current && (
          <ReviewTable
            data={current.extractedData}
            unit={current.unit}
            statementType={current.statementType}
            onDataChange={updated => updateEntry(activeIndex, { extractedData: updated })}
            onUnitChange={unit => updateEntry(activeIndex, { unit })}
            onStatementTypeChange={type => updateEntry(activeIndex, { statementType: type })}
            onCompanyNameChange={name => setGlobalCompanyName(name)}
          />
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.push('/')} className="flex-1 py-3 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            ← やり直す
          </button>
          <button
            onClick={handleSaveAndProceed}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            {saving ? '保存中...' : '確認完了 → ダッシュボードへ'}
          </button>
        </div>
      </div>
    </div>
  )
}
