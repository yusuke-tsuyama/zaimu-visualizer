import Logo from '@/components/Logo'

export const metadata = {
  title: '現在停止中 | 財務三表ビジュアライザー',
  robots: { index: false },
}

export default function MaintenancePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: '#0a1628' }}
    >
      <Logo size={72} />
      <div>
        <h1 className="text-2xl font-medium text-blue-100 tracking-wide mb-2">
          財務三表ビジュアライザー
        </h1>
        <p className="text-base text-blue-300">現在停止中（再開準備中）</p>
      </div>
      <p className="max-w-md text-sm text-blue-400 leading-relaxed">
        ただいま本サービスは一時的に停止しています。
        <br />
        再開の時期は未定です。ご利用いただいていた方には、ご不便をおかけします。
      </p>
      <p className="text-xs text-blue-600 tracking-widest uppercase">
        制作：YUSUKE TSUYAMA
      </p>
    </div>
  )
}
