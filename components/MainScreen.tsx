'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'
import UploadArea from './UploadArea'
import FileList from './FileList'
import AnalyzingOverlay from './AnalyzingOverlay'
import TutorialScreen from './TutorialScreen'
import { UploadedFile, ExtractedData } from '@/lib/types'
import { extractAndAnalyzePdf } from '@/lib/analyzeClient'

function emptyStatements() {
  return {
    revenue: null, operatingProfit: null, ordinaryProfit: null,
    netIncome: null, totalAssets: null, totalLiabilities: null,
    netAssets: null, equityRatio: null, operatingCF: null,
    investingCF: null, financingCF: null, freeCF: null,
    roe: null, roa: null, operatingMargin: null,
  }
}

export default function MainScreen() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [analyzeStep, setAnalyzeStep] = useState<'reading' | 'extracting' | 'analyzing' | 'rendering' | null>(null)
  const [progress, setProgress] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleYearChange = (index: number, year: number) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, fiscalYear: year } : f))
  }

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) { setError('PDFファイルをアップロードしてください'); return }
    const missingYear = files.some(f => !f.fiscalYear)
    if (missingYear) { setError('すべてのファイルに年度を設定してください'); return }
    setError(null)
    const extractedResults: ExtractedData[] = []
    for (let i = 0; i < files.length; i++) {
      const uf = files[i]
      setAnalyzeStep('reading')
      setProgress(Math.round((i / files.length) * 100 + 5))
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'extracting' } : f))
      try {
        setAnalyzeStep('extracting')
        setProgress(Math.round((i / files.length) * 100 + 20))
        const result = await extractAndAnalyzePdf(uf.file, uf.fiscalYear!)
        setAnalyzeStep('analyzing')
        setProgress(Math.round((i / files.length) * 100 + 60))
        extractedResults.push(result)
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', extractedData: result } : f))
      } catch (err) {
        const errorResult: ExtractedData = {
          companyName: '', fiscalYear: uf.fiscalYear!,
          statements: emptyStatements(),
          confidence: { revenue: 'low', operatingProfit: 'low', netIncome: 'low' },
          warnings: [`${uf.file.name}: ${String(err)}`],
          rawText: '',
        }
        extractedResults.push(errorResult)
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', errorMessage: String(err) } : f))
      }
    }
    setAnalyzeStep('rendering')
    setProgress(95)
    sessionStorage.setItem('extractedResults', JSON.stringify(extractedResults))
    sessionStorage.setItem('uploadedFiles', JSON.stringify(
      files.map(f => ({ name: f.file.name, fiscalYear: f.fiscalYear }))
    ))
    await new Promise(r => setTimeout(r, 500))
    setProgress(100)
    setAnalyzeStep(null)
    router.push('/review')
  }, [files, router])

  return (
    <>
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
            <TutorialScreen onStart={() => setShowTutorial(false)} isModal />
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between" style={{ background: '#0a1628' }}>
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <h1 className="text-base font-medium text-blue-100">財務三表ビジュアライザー</h1>
              <p className="text-xs text-blue-500">合同会社リベルダード</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTutorial(true)} className="text-xs text-blue-300 border border-blue-700 rounded-lg px-3 py-1.5 hover:bg-blue-900 transition-colors">使い方</button>
            <button onClick={() => router.push('/history')} className="text-xs text-blue-300 border border-blue-700 rounded-lg px-3 py-1.5 hover:bg-blue-900 transition-colors">過去の分析</button>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">決算書PDFをアップロード</h2>
            <UploadArea files={files} onFilesChange={setFiles} maxFiles={10} />
          </div>
          {files.length > 0 && <FileList files={files} onYearChange={handleYearChange} onRemove={handleRemove} />}
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          <button
            onClick={handleAnalyze}
            disabled={!!analyzeStep || files.length === 0}
            className={`w-full py-4 rounded-xl font-medium text-base transition-all ${files.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            財務三表を分析する
          </button>
          <p className="text-xs text-center text-gray-400">AI（Claude）が財務数値を抽出し、グラフを生成します</p>
          <AnalyzingOverlay step={analyzeStep} progress={progress} />
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            PDFの形式によっては正しく抽出できない場合があります。抽出後の確認・修正画面で必ず数値をご確認ください。
          </div>
        </main>
      </div>
    </>
  )
}
