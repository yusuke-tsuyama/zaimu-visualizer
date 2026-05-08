'use client'

import { Suspense } from 'react'
import DashboardContent from './DashboardContent'

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
