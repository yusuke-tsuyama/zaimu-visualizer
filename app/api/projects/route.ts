import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { FinancialStatement, AiComment } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const projectId = req.nextUrl.searchParams.get("projectId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    if (projectId) {
      const { data, error } = await supabase
        .from("analysis_projects")
        .select("id, company_name, fiscal_year_start, fiscal_year_end, memo, created_at, financial_statements (*), ai_comments (*)")
        .eq("id", projectId)
        .eq("session_id", sessionId)
        .single();

      if (error) throw new Error(error.message);

      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("analysis_projects")
      .select("id, company_name, fiscal_year_start, fiscal_year_end, memo, created_at, financial_statements (*)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      companyName,
      statements,
      aiComment,
      uploadedFiles,
      memo = "",
    }: {
      sessionId: string;
      companyName: string;
      statements: FinancialStatement[];
      aiComment: AiComment | null;
      uploadedFiles: { name: string; fiscalYear: number }[];
      memo?: string;
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const years = statements.map((s) => s.fiscalYear).filter(Boolean);
    const fiscalYearStart = Math.min(...years);
    const fiscalYearEnd = Math.max(...years);

    const { data: project, error: projErr } = await supabase
      .from("analysis_projects")
      .insert({
        session_id: sessionId,
        company_name: companyName,
        fiscal_year_start: fiscalYearStart,
        fiscal_year_end: fiscalYearEnd,
        memo,
      })
      .select()
      .single();

    if (projErr) throw new Error(projErr.message);

    const projectId = project.id;

    const keys: (keyof FinancialStatement)[] = [
      "revenue", "operatingProfit", "ordinaryProfit", "netIncome",
      "totalAssets", "totalLiabilities", "netAssets", "equityRatio",
      "operatingCF", "investingCF", "financingCF", "freeCF",
      "roe", "roa", "operatingMargin",
    ];
    const dbKeys = [
      "revenue", "operating_profit", "ordinary_profit", "net_income",
      "total_assets", "total_liabilities", "net_assets", "equity_ratio",
      "operating_cf", "investing_cf", "financing_cf", "free_cf",
      "roe", "roa", "operating_margin",
    ];

    const stmtRows = statements.map((s) => {
      const row: Record<string, unknown> = {
        project_id: projectId,
        fiscal_year: s.fiscalYear,
        unit: s.unit,
        statement_type: s.statementType,
        source_file_name: s.sourceFileName ?? null,
      };
      keys.forEach((k, i) => {
        const val = s[k];
        row[dbKeys[i]] = val !== undefined && val !== null ? Number(val) : null;
      });
      return row;
    });

    const { error: stmtErr } = await supabase.from("financial_statements").insert(stmtRows);
    if (stmtErr) throw new Error(stmtErr.message);

    if (aiComment) {
      await supabase.from("ai_comments").insert({
        project_id: projectId,
        summary: aiComment.summary,
        growth_comment: aiComment.growthComment,
        profitability_comment: aiComment.profitabilityComment,
        safety_comment: aiComment.safetyComment,
        cashflow_comment: aiComment.cashflowComment,
        investment_comment: aiComment.investmentComment,
        risk_comment: aiComment.riskComment,
      });
    }

    if (uploadedFiles.length > 0) {
      await supabase.from("uploaded_files").insert(
        uploadedFiles.map((f) => ({
          project_id: projectId,
          file_name: f.name,
          fiscal_year: f.fiscalYear,
        }))
      );
    }

    return NextResponse.json({ projectId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId, projectId } = await req.json();

    if (!sessionId || !projectId) {
      return NextResponse.json({ error: "sessionId and projectId are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("analysis_projects")
      .delete()
      .eq("id", projectId)
      .eq("session_id", sessionId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, projectId, memo } = await req.json();

    if (!sessionId || !projectId) {
      return NextResponse.json({ error: "sessionId and projectId are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from("analysis_projects")
      .update({ memo, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("session_id", sessionId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
