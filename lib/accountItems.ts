
export type StatementType = 'bs' | 'pl' | 'cf'

export interface AccountItem {
  id: string
  label: string
  statementType: StatementType
  category: string
  isDefault: boolean
  isNegative?: boolean
}

export const DEFAULT_ACCOUNT_ITEMS: AccountItem[] = [
  // B/S 資産
  { id: 'cash', label: '現金・預金', statementType: 'bs', category: '流動資産', isDefault: true },
  { id: 'receivable', label: '売掛金・受取手形', statementType: 'bs', category: '流動資産', isDefault: true },
  { id: 'inventory', label: '棚卸資産', statementType: 'bs', category: '流動資産', isDefault: true },
  { id: 'otherCurrentAsset', label: 'その他流動資産', statementType: 'bs', category: '流動資産', isDefault: true },
  { id: 'totalCurrentAsset', label: '流動資産合計', statementType: 'bs', category: '流動資産', isDefault: true },
  { id: 'tangibleAsset', label: '有形固定資産', statementType: 'bs', category: '固定資産', isDefault: true },
  { id: 'intangibleAsset', label: '無形固定資産', statementType: 'bs', category: '固定資産', isDefault: true },
  { id: 'investmentAsset', label: '投資その他の資産', statementType: 'bs', category: '固定資産', isDefault: true },
  { id: 'totalFixedAsset', label: '固定資産合計', statementType: 'bs', category: '固定資産', isDefault: true },
  { id: 'totalAssets', label: '資産合計', statementType: 'bs', category: '資産合計', isDefault: true },

  // B/S 負債
  { id: 'payable', label: '買掛金・支払手形', statementType: 'bs', category: '流動負債', isDefault: true },
  { id: 'shortTermDebt', label: '短期借入金', statementType: 'bs', category: '流動負債', isDefault: true },
  { id: 'otherCurrentLiability', label: 'その他流動負債', statementType: 'bs', category: '流動負債', isDefault: true },
  { id: 'totalCurrentLiability', label: '流動負債合計', statementType: 'bs', category: '流動負債', isDefault: true },
  { id: 'longTermDebt', label: '長期借入金', statementType: 'bs', category: '固定負債', isDefault: true },
  { id: 'otherFixedLiability', label: 'その他固定負債', statementType: 'bs', category: '固定負債', isDefault: true },
  { id: 'totalFixedLiability', label: '固定負債合計', statementType: 'bs', category: '固定負債', isDefault: true },
  { id: 'totalLiabilities', label: '負債合計', statementType: 'bs', category: '負債合計', isDefault: true },

  // B/S 純資産
  { id: 'capitalStock', label: '資本金', statementType: 'bs', category: '純資産', isDefault: true },
  { id: 'retainedEarnings', label: '利益剰余金', statementType: 'bs', category: '純資産', isDefault: true },
  { id: 'netAssets', label: '純資産合計', statementType: 'bs', category: '純資産', isDefault: true },
  { id: 'equityRatio', label: '自己資本比率(%)', statementType: 'bs', category: '純資産', isDefault: true },

  // P/L
  { id: 'revenue', label: '売上高', statementType: 'pl', category: '売上', isDefault: true },
  { id: 'costOfSales', label: '売上原価', statementType: 'pl', category: '売上', isDefault: true },
  { id: 'grossProfit', label: '売上総利益', statementType: 'pl', category: '売上', isDefault: true },
  { id: 'sgaExpense', label: '販売費及び一般管理費', statementType: 'pl', category: '費用', isDefault: true },
  { id: 'operatingProfit', label: '営業利益', statementType: 'pl', category: '利益', isDefault: true },
  { id: 'nonOperatingIncome', label: '営業外収益', statementType: 'pl', category: '営業外', isDefault: true },
  { id: 'nonOperatingExpense', label: '営業外費用', statementType: 'pl', category: '営業外', isDefault: true },
  { id: 'ordinaryProfit', label: '経常利益', statementType: 'pl', category: '利益', isDefault: true },
  { id: 'extraordinaryIncome', label: '特別利益', statementType: 'pl', category: '特別損益', isDefault: true },
  { id: 'extraordinaryLoss', label: '特別損失', statementType: 'pl', category: '特別損益', isDefault: true },
  { id: 'pretaxProfit', label: '税引前当期純利益', statementType: 'pl', category: '利益', isDefault: true },
  { id: 'incomeTax', label: '法人税等', statementType: 'pl', category: '税金', isDefault: true },
  { id: 'netIncome', label: '当期純利益', statementType: 'pl', category: '利益', isDefault: true },
  { id: 'operatingMargin', label: '営業利益率(%)', statementType: 'pl', category: '指標', isDefault: true },

  // C/F
  { id: 'operatingCF', label: '営業活動によるキャッシュフロー', statementType: 'cf', category: 'CF', isDefault: true },
  { id: 'investingCF', label: '投資活動によるキャッシュフロー', statementType: 'cf', category: 'CF', isDefault: true },
  { id: 'financingCF', label: '財務活動によるキャッシュフロー', statementType: 'cf', category: 'CF', isDefault: true },
  { id: 'freeCF', label: 'フリーキャッシュフロー', statementType: 'cf', category: 'CF', isDefault: true },
  { id: 'cashAndEquivalents', label: '現金及び現金同等物期末残高', statementType: 'cf', category: 'CF', isDefault: true },

  // 経営指標
  { id: 'roe', label: 'ROE(%)', statementType: 'pl', category: '指標', isDefault: true },
  { id: 'roa', label: 'ROA(%)', statementType: 'pl', category: '指標', isDefault: true },
]

export const STATEMENT_LABELS = {
  bs: '貸借対照表（B/S）',
  pl: '損益計算書（P/L）',
  cf: 'キャッシュフロー計算書（C/F）',
}

export const CATEGORY_ORDER = {
  bs: ['流動資産', '固定資産', '資産合計', '流動負債', '固定負債', '負債合計', '純資産'],
  pl: ['売上', '費用', '利益', '営業外', '特別損益', '税金', '指標'],
  cf: ['CF'],
}
