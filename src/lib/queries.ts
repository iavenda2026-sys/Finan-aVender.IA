import { db } from "@/db";
import { companies, revenues, expenses } from "@/db/schema";
import { eq, sql, sum, desc, and, gte, lte } from "drizzle-orm";

export type DashboardPeriod = "all" | "month" | "year" | "custom";

export type DashboardFilters = {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
};

function getDateRange(filters: DashboardFilters = {}) {
  const period = filters.period || "all";
  const today = new Date();
  const currentDate = today.toISOString().slice(0, 10);

  if (period === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      period,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }

  if (period === "year") {
    return {
      period,
      startDate: `${today.getFullYear()}-01-01`,
      endDate: `${today.getFullYear()}-12-31`,
    };
  }

  if (period === "custom" && filters.startDate && filters.endDate) {
    return {
      period,
      startDate: filters.startDate <= filters.endDate ? filters.startDate : filters.endDate,
      endDate: filters.startDate <= filters.endDate ? filters.endDate : filters.startDate,
    };
  }

  return { period: "all" as const, startDate: undefined, endDate: undefined, currentDate };
}

function dateConditions(column: typeof revenues.receivedAt | typeof expenses.dueDate, filters: ReturnType<typeof getDateRange>) {
  return filters.startDate && filters.endDate
    ? and(gte(column, filters.startDate), lte(column, filters.endDate))
    : undefined;
}

export async function getCompanies() {
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getDashboardData(filters: DashboardFilters = {}) {
  const dateRange = getDateRange(filters);
  const allCompanies = await getCompanies();

  const revenueResult = await db
    .select({
      total: sum(revenues.amount),
      companyId: revenues.companyId,
      category: revenues.category,
    })
    .from(revenues)
    .where(dateConditions(revenues.receivedAt, dateRange))
    .groupBy(revenues.companyId, revenues.category);

  const expenseResult = await db
    .select({
      total: sum(expenses.amount),
      companyId: expenses.companyId,
      category: expenses.category,
      paid: expenses.paid,
    })
    .from(expenses)
    .where(dateConditions(expenses.dueDate, dateRange))
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

  const [monthlyRevenues, monthlyExpenses] = await Promise.all([
    db.select({ month: sql<string>`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM')`, total: sum(revenues.amount) }).from(revenues).where(dateConditions(revenues.receivedAt, dateRange)).groupBy(sql`1`).orderBy(sql`1`),
    db.select({ month: sql<string>`TO_CHAR(${expenses.dueDate}, 'YYYY-MM')`, total: sum(expenses.amount) }).from(expenses).where(dateConditions(expenses.dueDate, dateRange)).groupBy(sql`1`).orderBy(sql`1`),
  ]);
  const monthlyMap = new Map<string, { receitas: number; despesas: number }>();
  for (const item of monthlyRevenues) monthlyMap.set(item.month, { receitas: Number(item.total || 0), despesas: monthlyMap.get(item.month)?.despesas || 0 });
  for (const item of monthlyExpenses) monthlyMap.set(item.month, { receitas: monthlyMap.get(item.month)?.receitas || 0, despesas: Number(item.total || 0) });

  const aggregateByCategory = (items: { category: string; total: number }[]) => {
    const totals = new Map<string, number>();
    for (const item of items) totals.set(item.category, (totals.get(item.category) || 0) + item.total);
    return Array.from(totals, ([category, total]) => ({ category, total }));
  };

  return {
    period: dateRange.period,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    totals: { 
      revenue: totalRevenue,
      expense: totalExpense,
      balance: totalRevenue - totalExpense,
      paidExpenses,
      pendingExpenses,
    },
    byCompany,
    monthlyTrend: Array.from(monthlyMap, ([month, values]) => ({ month, ...values })),
    revenueByCategory: aggregateByCategory(revenueResult.map((r) => ({
      category: r.category,
      total: Number(r.total || 0),
    }))),
    expenseByCategory: aggregateByCategory(expenseResult.map((e) => ({
      category: e.category,
      total: Number(e.total || 0),
    }))),
  };
}

export async function getRevenues(companyId?: string, month?: string) {
  const conditions: (ReturnType<typeof eq> | ReturnType<typeof sql>)[] = [];
  if (companyId) conditions.push(eq(revenues.companyId, companyId));
  if (month) conditions.push(sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${month}`);

  return db
    .select({ revenue: revenues, company: companies })
    .from(revenues)
    .leftJoin(companies, eq(revenues.companyId, companies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(revenues.receivedAt));
}

export async function getExpenses(companyId?: string, month?: string, pending?: boolean) {
  const conditions: (ReturnType<typeof eq> | ReturnType<typeof sql>)[] = [];
  if (companyId) conditions.push(eq(expenses.companyId, companyId));
  if (month) conditions.push(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${month}`);
  if (pending) conditions.push(eq(expenses.paid, false));

  return db
    .select({ expense: expenses, company: companies })
    .from(expenses)
    .leftJoin(companies, eq(expenses.companyId, companies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(expenses.dueDate));
}

export async function getUpcomingExpenses(limit = 5) {
  return db
    .select({ expense: expenses, company: companies })
    .from(expenses)
    .leftJoin(companies, eq(expenses.companyId, companies.id))
    .where(and(eq(expenses.paid, false), sql`${expenses.dueDate} >= CURRENT_DATE`))
    .orderBy(expenses.dueDate)
    .limit(limit);
}
