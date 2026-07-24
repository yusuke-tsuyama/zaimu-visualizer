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
