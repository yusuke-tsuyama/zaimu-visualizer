import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MAINTENANCE_MODE=1 のとき、全ページを /maintenance に切り替え、APIを503で止める。
// 解除は環境変数を外して再デプロイするだけ。
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== '1') return NextResponse.next()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: '現在サービスを停止しています（再開準備中）。' },
      { status: 503, headers: { 'Retry-After': '86400' } },
    )
  }
  if (pathname === '/maintenance') return NextResponse.next()

  return NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
}
