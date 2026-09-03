import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, companies } from "@/db/schema";
import { desc, eq, and, SQL, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const month = searchParams.get("month");
  const pending = searchParams.get("pending");

  const conditions: SQL<unknown>[] = [];

  if (companyId) {
    conditions.push(eq(expenses.companyId, companyId));
  }

  if (month) {
    conditions.push(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') = ${month}`);
  }

  if (pending === "true") {
    conditions.push(eq(expenses.paid, false));
  }

  const result = await db
    .select({
      expense: expenses,
      company: companies,
    })
    .from(expenses)
    .leftJoin(companies, eq(expenses.companyId, companies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(expenses.dueDate));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [expense] = await db
    .insert(expenses)
    .values({
      companyId: body.companyId,
      description: body.description,
      category: body.category,
      amount: body.amount,
      dueDate: body.dueDate,
      isRecurring: body.isRecurring || false,
      recurrenceDay: body.recurrenceDay,
      paid: body.paid || false,
      paidAt: body.paidAt,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(expense, { status: 201 });
}
