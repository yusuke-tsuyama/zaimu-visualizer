import { getSessionId } from "@/lib/session";
import { FinancialStatement, AiComment, AnalysisProject } from "./types";

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
      .map((s) => ({
        fiscalYear: s.fiscal_year as number,
        revenue: s.revenue as number | null,
        operatingProfit: s.operating_profit as number | null,
        ordinaryProfit: s.ordinary_profit as number | null,
        netIncome: s.net_income as number | null,
        totalAssets: s.total_assets as number | null,
        totalLiabilities: s.total_liabilities as number | null,
        netAssets: s.net_assets as number | null,
        equityRatio: s.equity_ratio as number | null,
        operatingCF: s.operating_cf as number | null,
        investingCF: s.investing_cf as number | null,
        financingCF: s.financing_cf as number | null,
        freeCF: s.free_cf as number | null,
        roe: s.roe as number | null,
        roa: s.roa as number | null,
        operatingMargin: s.operating_margin as number | null,
        unit: ((s.unit as string) ?? "百万円") as FinancialStatement["unit"],
        statementType: ((s.statement_type as string) ?? "連結") as FinancialStatement["statementType"],
        sourceFileName: s.source_file_name as string | undefined,
      })),
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
