import { NextResponse } from "next/server";
import { db } from "@/db";
import { revenues, expenses, companies } from "@/db/schema";
import { eq, sql, sum, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));

  const revenueResult = await db
    .select({
      total: sum(revenues.amount),
      companyId: revenues.companyId,
      category: revenues.category,
    })
    .from(revenues)
    .where(sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${month}`)
    .groupBy(revenues.companyId, revenues.category);

  const expenseResult = await db
    .select({
      total: sum(expenses.amount),
      companyId: expenses.companyId,
      category: expenses.category,
      paid: expenses.paid,
    })
    .from(expenses)
    .where(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${month}`)
    .groupBy(expenses.companyId, expenses.category, expenses.paid);

  const totalRevenue = revenueResult.reduce(
    (acc, curr) => acc + Number(curr.total || 0),
    0
  );
  const totalExpense = expenseResult.reduce(
    (acc, curr) => acc + Number(curr.total || 0),
    0
  );
  const paidExpenses = expenseResult
    .filter((e) => e.paid)
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const pendingExpenses = expenseResult
    .filter((e) => !e.paid)
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const byCompany = allCompanies.map((company) => {
    const rev = revenueResult
      .filter((r) => r.companyId === company.id)
      .reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    const exp = expenseResult
      .filter((e) => e.companyId === company.id)
      .reduce((acc, curr) => acc + Number(curr.total || 0), 0);
    return {
      company,
      revenue: rev,
      expense: exp,
      balance: rev - exp,
    };
  });

  const revenueByCategory = revenueResult.map((r) => ({
    category: r.category,
    total: Number(r.total || 0),
  }));

  const expenseByCategory = expenseResult.map((e) => ({
    category: e.category,
    total: Number(e.total || 0),
    paid: e.paid,
  }));

  return NextResponse.json({
    month,
    totals: {
      revenue: totalRevenue,
      expense: totalExpense,
      balance: totalRevenue - totalExpense,
      paidExpenses,
      pendingExpenses,
    },
    byCompany,
    revenueByCategory,
    expenseByCategory,
  });
}
