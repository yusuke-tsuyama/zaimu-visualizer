'use client'

import { useCallback, useState } from 'react'
import { UploadedFile } from '@/lib/types'

function estimateFiscalYear(fileName: string): number | null {
  const matches = fileName.match(/20([12]\d)/g)
  if (matches && matches.length > 0) {
    const years = matches.map(Number).filter(y => y >= 2000 && y <= 2035)
    if (years.length > 0) return Math.max(...years)
  }
  const shortMatch = fileName.match(/(?:FY|fy)(\d{2})/)
  if (shortMatch) {
    const yr = parseInt(shortMatch[1])
    return yr + (yr < 50 ? 2000 : 1900)
  }
  return null
}

interface Props {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

export default function UploadArea({ files, onFilesChange, maxFiles = 10 }: Props) {
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const pdfFiles = fileArray.filter(f => f.type === 'application/pdf')
    if (pdfFiles.length === 0) { alert('PDFファイルのみアップロードできます'); return }
    const remaining = maxFiles - files.length
    const toAdd = pdfFiles.slice(0, remaining)
    const uploadedFiles: UploadedFile[] = toAdd.map(file => ({
      file,
      fiscalYear: estimateFiscalYear(file.name),
      estimatedYear: estimateFiscalYear(file.name),
      status: 'pending',
    }))
    onFilesChange([...files, ...uploadedFiles])
  }, [files, onFilesChange, maxFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const isFull = files.length >= maxFiles

  return (
    <label
      className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isFull ? 'opacity-40 cursor-not-allowed border-gray-200' : ''} ${dragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
    >
      <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleChange} disabled={isFull} />
      <div className="text-4xl mb-3">📂</div>
      <p className="text-base font-medium text-gray-800 mb-1">{isFull ? '上限（10件）に達しました' : 'PDFファイルをドラッグ＆ドロップ'}</p>
      <p className="text-sm text-gray-500">{isFull ? '' : 'または クリックしてファイルを選択 · 複数PDF対応'}</p>
      <p className="text-xs text-gray-400 mt-2">最大{maxFiles}年分 · 1ファイル50MBまで · 日本語PDF対応</p>
    </label>
  )
}
