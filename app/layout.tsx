import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '財務三表ビジュアライザー | 合同会社リベルダード',
  description: '決算書PDFから財務三表を自動抽出・可視化するアプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  )
}
