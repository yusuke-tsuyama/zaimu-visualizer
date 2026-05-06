'use client'

import { useEffect } from 'react'
import Logo from './Logo'

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: '#0a1628' }}
    >
      <Logo size={80} />
      <div className="text-center">
        <h1 className="text-2xl font-medium text-blue-100 tracking-wide mb-2">
          財務三表ビジュアライザー
        </h1>
        <p className="text-sm text-blue-400">
          損益計算書 · 貸借対照表 · キャッシュフロー計算書
        </p>
      </div>
      <p className="text-xs text-blue-600 tracking-widest uppercase">
        制作：合同会社リベルダード
      </p>
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}