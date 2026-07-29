<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 財務三表ビジュアライザー 実装ルール

## 単位変換
金額の軸ラベル変換は lib/chartHelpers.ts の formatAxisValue に集約済み。
新しいグラフを追加する際は必ずこれを import すること。
各コンポーネント内に fmt 関数を定義しないこと。

過去に RevenueChart.tsx と CfChart.tsx へ同一コードをコピペした結果、
除数の誤り（10000 → 正しくは100000）が両方に残り、
Y軸が10倍ずれるバグが発生した。
データは千円単位で保持しているため、1億円 = 100,000千円である。

なお RatioChart.tsx の fmt は比率表示専用（toFixed(1) + '%'）であり、
金額換算とは無関係。統合しないこと。

## 比率指標の前期比
自己資本比率・ROE・ROA・営業利益率は、
変化率（%）ではなくポイント差（pt）で表示する。
calcDelta の第3引数 isRatio に kpi.isPercent を渡すこと。
KpiCard 側も isPercent で末尾の pt / % を切り替えている。

## 算出不能値の扱い
純資産がマイナスの期は ROE を算出できない。
Number(null) は NaN ではなく 0 を返すため、
null チェックを省くと「0.0%」と誤表示される。
undefined と null の両方をチェックすること。
算出不能な場合の表示は「—」に統一する（KPIカード・一覧テーブル）。
AIコメント側は 'N/A' を使用。

## 環境変数（Supabase）の注意点
- NEXT_PUBLIC_SUPABASE_URL は https://xxx.supabase.co で終わること。
  末尾に /rest/v1/ を付けない（クライアントが自動付与し二重パスになる）。
- キーは Legacy anon / service_role（eyJ... のJWT形式）を使う。
  新方式（sb_publishable_...）はコード未対応。
- VercelのSupabase系変数はSensitive指定のため vercel env pull では値が取れず
  空文字が返る。値の確認・再取得はSupabaseダッシュボードから行う。

## DB読み込みのキー変換
DBはsnake_case、コードはcamelCase。DBから読んだ行は必ず
lib/supabaseOperations.ts の normalizeStatement で変換すること。
コンポーネント内で個別に変換しないこと（変換漏れで再表示が壊れる）。

## レート制限の設計
- lib/rateLimit.ts の enforceRateLimit に一本化。上限は RATE_LIMITS 定数で管理
  （SESSION_PER_DAY=15, IP_PER_DAY=45）。数値変更はこの1箇所。
- カウント単位は「analyze 1回=1期分」。5期の企業なら5カウント消費する。
- rate_limits テーブルの ip_address 列に、IPと "sess:<sessionId>" の両方を格納
  して二層管理する（スキーマ変更を避けるための設計）。
- analyze でのみカウント。ai-comment はカウントしない（analyzeで締めるため）。
- sessionId は analyzeClient.ts が getSessionId() で送信。認証ではなくlocalStorage
  ベースなので削除で回避可能。最終防衛はAnthropic APIのspend limit($200)。

## レート制限
lib/rateLimit.ts の enforceRateLimit に一本化。上限は RATE_LIMITS 定数
（SESSION_PER_DAY=15, IP_PER_DAY=45）。1カウント=analyze 1回=1期分。
rate_limits テーブルの ip_address 列に IP と "sess:<sessionId>" を格納して二層管理。
sessionId は analyzeClient が getSessionId() で送信（localStorageベース、回避可能）。
最終防衛は Anthropic API の spend limit($200)。

## 未対応の課題
- 利用規約改訂時の既存ユーザー再同意（同意フラグにバージョン管理が無い）
- app/api/debug-save が本番に露出（削除または制限を検討）
- rate_limits テーブルに (ip_address, date) の UNIQUE 制約を追加すると堅牢

## セキュリティ：アクセス制御の構造
- DB操作は getAdminClient()（サービスロールキー）経由でRLSをバイパス。
  schema.sql のRLSポリシー（auth.uid ベース）は認証がないため実質機能していない。
- アクセス制御は各APIコード内の .eq("session_id", sessionId) フィルタのみが担う。
  新規APIで analysis_projects 等に触るなら、必ず session_id で絞ること。
  フィルタ漏れが即データ漏洩につながる。
- 2026-07-29: 認証もフィルタもない debug-save エンドポイントを削除（GETで
  誰でもDB書き込み可能な穴だった）。
- 【要検討】コードフィルタ単独依存は脆い。将来 session_id ベースのRLS等で
  DBレベルの多層防御を回復したい（認証なしRLSは設計難、別途検討）。
