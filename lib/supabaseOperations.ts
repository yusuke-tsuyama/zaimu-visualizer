import { getSessionId } from "@/lib/session";
import { FinancialStatement, AiComment, AnalysisProject } from "./types";

// DBの1行（snake_case）を FinancialStatement（camelCase）へ変換する。
// DB読み込みの変換責任をここに一本化する。複数箇所で個別実装しないこと。
export function normalizeStatement(s: Record<string, unknown>): FinancialStatement {
  const n = (v: unknown): number | null =>
    v === null || v === undefined ? null : Number(v);
  return {
    fiscalYear: s.fiscal_year as number,
    revenue: n(s.revenue),
    operatingProfit: n(s.operating_profit),
    ordinaryProfit: n(s.ordinary_profit),
    netIncome: n(s.net_income),
    totalAssets: n(s.total_assets),
    totalLiabilities: n(s.total_liabilities),
    netAssets: n(s.net_assets),
    equityRatio: n(s.equity_ratio),
    operatingCF: n(s.operating_cf),
    investingCF: n(s.investing_cf),
    financingCF: n(s.financing_cf),
    freeCF: n(s.free_cf),
    roe: n(s.roe),
    roa: n(s.roa),
    operatingMargin: n(s.operating_margin),
    unit: ((s.unit as string) ?? "百万円") as FinancialStatement["unit"],
    statementType: ((s.statement_type as string) ?? "連結") as FinancialStatement["statementType"],
    sourceFileName: s.source_file_name as string | undefined,
  };
}

export async function saveAnalysisProject({
  companyName, statements, aiComment, uploadedFiles, memo = "",
}: {
  companyName: string;
  statements: FinancialStatement[];
  aiComment: AiComment | null;
  uploadedFiles: { name: string; fiscalYear: number }[];
  memo?: string;
}): Promise<string> {
  const sessionId = getSessionId();
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, companyName, statements, aiComment, uploadedFiles, memo }),
  });
  if (!res.ok) throw new Error(await res.text());
  const { projectId } = await res.json();
  return projectId;
}

export async function fetchProjects(): Promise<AnalysisProject[]> {
  const sessionId = getSessionId();
  const res = await fetch(`/api/projects?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(await res.text());
  const { data } = await res.json();

  return (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id,
    companyName: p.company_name,
    fiscalYearStart: p.fiscal_year_start,
    fiscalYearEnd: p.fiscal_year_end,
    memo: (p.memo as string) ?? "",
    createdAt: p.created_at,
    statements: ((p.financial_statements as Record<string, unknown>[]) ?? [])
      .sort((a, b) => (a.fiscal_year as number) - (b.fiscal_year as number))
      .map(normalizeStatement),
  }));
}

export async function fetchProjectWithComment(projectId: string) {
  const sessionId = getSessionId();
  const res = await fetch(
    `/api/projects?sessionId=${encodeURIComponent(sessionId)}&projectId=${encodeURIComponent(projectId)}`
  );
  if (!res.ok) throw new Error(await res.text());
  const { data } = await res.json();
  return data;
}

export async function deleteProject(projectId: string) {
  const sessionId = getSessionId();
  const res = await fetch("/api/projects", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, projectId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateProjectMemo(projectId: string, memo: string) {
  const sessionId = getSessionId();
  const res = await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, projectId, memo }),
  });
  if (!res.ok) throw new Error(await res.text());
}
