
import { db } from "@/db";
import { companies, revenues, expenses } from "@/db/schema";
import { eq, sql, sum, desc, and } from "drizzle-orm";

// ==========================================
// BUSCAR TODAS AS EMPRESAS
// ==========================================

export async function getCompanies() {
  return db
    .select()
    .from(companies)
    .orderBy(desc(companies.createdAt));
}

// ==========================================
// DASHBOARD - FINANCEIRO GERAL
// ==========================================
// Sem mês: soma todos os períodos.
// Com mês: filtra pelo mês informado.
// Inclui movimentações de empresas inativas.
// ==========================================

export async function getDashboardData(month?: string) {
  const allCompanies = await getCompanies();

  // RECEITAS
  const revenueResult = await db
    .select({
      total: sum(revenues.amount),
      companyId: revenues.companyId,
      category: revenues.category,
    })
    .from(revenues)
    .where(
      month
        ? sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${month}`
        : undefined
    )
    .groupBy(
      revenues.companyId,
      revenues.category
    );

  // DESPESAS
  const expenseResult = await db
    .select({
      total: sum(expenses.amount),
      companyId: expenses.companyId,
      category: expenses.category,
      paid: expenses.paid,
    })
    .from(expenses)
    .where(
      month
        ? sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${month}`
        : undefined
    )
    .groupBy(
      expenses.companyId,
      expenses.category,
      expenses.paid
    );

  // TOTAL DE RECEITAS
  const totalRevenue = revenueResult.reduce(
    (acc, curr) => acc + Number(curr.total ?? 0),
    0
  );

  // TOTAL DE DESPESAS
  const totalExpense = expenseResult.reduce(
    (acc, curr) => acc + Number(curr.total ?? 0),
    0
  );

  // DESPESAS PAGAS
  const paidExpenses = expenseResult
    .filter((e) => e.paid)
    .reduce(
      (acc, curr) => acc + Number(curr.total ?? 0),
      0
    );

  // DESPESAS PENDENTES
  const pendingExpenses = expenseResult
    .filter((e) => !e.paid)
    .reduce(
      (acc, curr) => acc + Number(curr.total ?? 0),
      0
    );

  // SALDO GERAL
  const totalBalance = totalRevenue - totalExpense;

  // ==========================================
  // RESUMO DE CADA EMPRESA
  // ==========================================

  const byCompany = allCompanies.map((company) => {
    const rev = revenueResult
      .filter((r) => r.companyId === company.id)
      .reduce(
        (acc, curr) => acc + Number(curr.total ?? 0),
        0
      );

    const exp = expenseResult
      .filter((e) => e.companyId === company.id)
      .reduce(
        (acc, curr) => acc + Number(curr.total ?? 0),
        0
      );

    return {
      company,
      revenue: rev,
      expense: exp,
      balance: rev - exp,
    };
  });

  // ==========================================
  // RECEITAS POR CATEGORIA
  // ==========================================

  const revenueCategories = new Map<string, number>();

  for (const item of revenueResult) {
    const atual =
      revenueCategories.get(item.category) ?? 0;

    revenueCategories.set(
      item.category,
      atual + Number(item.total ?? 0)
    );
  }

  const revenueByCategory = Array.from(
    revenueCategories,
    ([category, total]) => ({
      category,
      total,
    })
  );

  // ==========================================
  // DESPESAS POR CATEGORIA
  // ==========================================

  const expenseCategories = new Map<string, number>();

  for (const item of expenseResult) {
    const atual =
      expenseCategories.get(item.category) ?? 0;

    expenseCategories.set(
      item.category,
      atual + Number(item.total ?? 0)
    );
  }

  const expenseByCategory = Array.from(
    expenseCategories,
    ([category, total]) => ({
      category,
      total,
    })
  );

  // ==========================================
  // RETORNO DO DASHBOARD
  // ==========================================

  return {
    month: month ?? "total",

    totals: {
      revenue: totalRevenue,
      expense: totalExpense,
      balance: totalBalance,
      paidExpenses,
      pendingExpenses,
    },

    byCompany,
    revenueByCategory,
    expenseByCategory,
  };
}

// ==========================================
// BUSCAR RECEITAS
// ==========================================

export async function getRevenues(
  companyId?: string,
  month?: string
) {
  const conditions: (
    | ReturnType<typeof eq>
    | ReturnType<typeof sql>
  )[] = [];

  if (companyId) {
    conditions.push(
      eq(revenues.companyId, companyId)
    );
  }

  if (month) {
    conditions.push(
      sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${month}`
    );
  }

  return db
    .select({
      revenue: revenues,
      company: companies,
    })
    .from(revenues)
    .leftJoin(
      companies,
      eq(revenues.companyId, companies.id)
    )
    .where(
      conditions.length
        ? and(...conditions)
        : undefined
    )
    .orderBy(desc(revenues.receivedAt));
}

// ==========================================
// BUSCAR DESPESAS
// ==========================================

export async function getExpenses(
  companyId?: string,
  month?: string,
  pending?: boolean
) {
  const conditions: (
    | ReturnType<typeof eq>
    | ReturnType<typeof sql>
  )[] = [];

  if (companyId) {
    conditions.push(
      eq(expenses.companyId, companyId)
    );
  }

  if (month) {
    conditions.push(
      sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${month}`
    );
  }

  if (pending) {
    conditions.push(
      eq(expenses.paid, false)
    );
  }

  return db
    .select({
      expense: expenses,
      company: companies,
    })
    .from(expenses)
    .leftJoin(
      companies,
      eq(expenses.companyId, companies.id)
    )
    .where(
      conditions.length
        ? and(...conditions)
        : undefined
    )
    .orderBy(desc(expenses.dueDate));
}

// ==========================================
// PRÓXIMOS VENCIMENTOS
// ==========================================

export async function getUpcomingExpenses(
  limit = 5
) {
  return db
    .select({
      expense: expenses,
      company: companies,
    })
    .from(expenses)
    .leftJoin(
      companies,
      eq(expenses.companyId, companies.id)
    )
    .where(
      and(
        eq(expenses.paid, false),
        sql`${expenses.dueDate} >= CURRENT_DATE`
      )
    )
    .orderBy(expenses.dueDate)
    .limit(limit);
}
