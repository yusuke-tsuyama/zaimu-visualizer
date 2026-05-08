'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { AnalysisProject } from '@/lib/types'
import { fetchProjects, deleteProject, updateProjectMemo } from '@/lib/supabaseOperations'

export default function HistoryPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<AnalysisProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMemo, setEditingMemo] = useState<string | null>(null)
  const [memoValue, setMemoValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (err) {
      setError('データの読み込みに失敗しました: ' + String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const handleDelete = async (id: string) => {
    if (!confirm('この分析結果を削除しますか？元に戻せません。')) return
    setDeletingId(id)
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError('削除に失敗しました: ' + String(err))
    } finally {
      setDeletingId(null)
    }
  }

  const handleMemoSave = async (id: string) => {
    try {
      await updateProjectMemo(id, memoValue)
      setProjects(prev => prev.map(p => p.id === id ? { ...p, memo: memoValue } : p))
      setEditingMemo(null)
    } catch (err) {
      setError('メモ保存に失敗しました: ' + String(err))
    }
  }

  const filtered = projects.filter(p =>
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between" style={{ background: '#0a1628' }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <h1 className="text-sm font-medium text-blue-100">過去の分析結果</h1>
            <p className="text-xs text-blue-500">合同会社リベルダード</p>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors">
          + 新規分析
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="企業名で検索..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm pl-9 focus:outline-none focus:border-blue-400 bg-white" />
          <span className="absolute left-3 top-3 text-gray-400 text-sm">🔍</span>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-3 animate-pulse">📂</div>
            <p className="text-sm">読み込み中...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-gray-500 mb-4">{searchQuery ? '検索結果がありません' : 'まだ保存された分析結果がありません'}</p>
            <button onClick={() => router.push('/')} className="text-sm text-blue-600 border border-blue-300 rounded-xl px-4 py-2 hover:bg-blue-50 transition-colors">最初の分析を始める</button>
          </div>
        )}

        {filtered.map(project => {
          const years = project.fiscalYearEnd - project.fiscalYearStart + 1
          const isEditing = editingMemo === project.id
          const isDeleting = deletingId === project.id
          const latest = project.statements[project.statements.length - 1]
          const u = (latest as { unit?: string })?.unit ?? '百万円'
          const fmt = (v: number | null | undefined) => {
            if (v === null || v === undefined) return '—'
            const num = Number(v)
            if (isNaN(num)) return '—'
            return num.toLocaleString() + u
          }

          return (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-medium text-gray-900 truncate">{project.companyName}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{project.fiscalYearStart}〜{project.fiscalYearEnd}年（{years}年分）· 保存日：{new Date(project.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{years}年分</span>
                </div>

                {latest && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: '売上高', value: fmt((latest as Record<string, unknown>).revenue as number | null) },
                      { label: '営業利益', value: fmt((latest as Record<string, unknown>).operatingProfit as number | null) },
                      { label: '純利益', value: fmt((latest as Record<string, unknown>).netIncome as number | null) },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isEditing ? (
                  <div className="mt-3">
                    <textarea value={memoValue} onChange={e => setMemoValue(e.target.value)} rows={2} placeholder="メモを入力..." className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" autoFocus />
                    <div className="flex gap-2 mt-1.5">
                      <button onClick={() => handleMemoSave(project.id)} className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors">保存</button>
                      <button onClick={() => setEditingMemo(null)} className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">キャンセル</button>
                    </div>
                  </div>
                ) : project.memo ? (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-amber-800 leading-relaxed">{project.memo}</p>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-gray-100 px-4 py-2 flex gap-2 bg-gray-50">
                <button onClick={() => router.push('/dashboard?project=' + project.id)} className="flex-1 text-xs bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors font-medium">再表示 →</button>
                <button onClick={() => { setEditingMemo(project.id); setMemoValue(project.memo ?? '') }} className="text-xs border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">メモ</button>
                <button onClick={() => handleDelete(project.id)} disabled={isDeleting} className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors disabled:opacity-40">
                  {isDeleting ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          )
        })}

        <div className="text-xs text-center text-gray-400 py-4">
          {!loading && projects.length + '件の分析結果'}
        </div>
      </main>
    </div>
  )
}
