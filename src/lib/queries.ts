import { db } from "@/db";
import { companies, revenues, expenses } from "@/db/schema";
import { eq, sql, sum, desc, and } from "drizzle-orm";

export async function getCompanies() {
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getDashboardData(month?: string) {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const allCompanies = await getCompanies();

  const revenueResult = await db
    .select({
      total: sum(revenues.amount),
      companyId: revenues.companyId,
      category: revenues.category,
    })
    .from(revenues)
    .where(sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${targetMonth}`)
    .groupBy(revenues.companyId, revenues.category);

  const expenseResult = await db
    .select({
      total: sum(expenses.amount),
      companyId: expenses.companyId,
      category: expenses.category,
      paid: expenses.paid,
    })
    .from(expenses)
    .where(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${targetMonth}`)
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

  return {
    month: targetMonth,
    totals: {
      revenue: totalRevenue,
      expense: totalExpense,
      balance: totalRevenue - totalExpense,
      paidExpenses,
      pendingExpenses,
    },
    byCompany,
    revenueByCategory: revenueResult.map((r) => ({
      category: r.category,
      total: Number(r.total || 0),
    })),
    expenseByCategory: expenseResult.map((e) => ({
      category: e.category,
      total: Number(e.total || 0),
      paid: e.paid,
    })),
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
