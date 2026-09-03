import { NextResponse } from "next/server";
import { db } from "@/db";
import { revenues, companies } from "@/db/schema";
import { desc, eq, and, SQL, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const month = searchParams.get("month");

  const conditions: SQL<unknown>[] = [];

  if (companyId) {
    conditions.push(eq(revenues.companyId, companyId));
  }

  if (month) {
    conditions.push(sql`TO_CHAR(${revenues.receivedAt}, 'YYYY-MM') = ${month}`);
  }

  const result = await db
    .select({
      revenue: revenues,
      company: companies,
    })
    .from(revenues)
    .leftJoin(companies, eq(revenues.companyId, companies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(revenues.receivedAt));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [revenue] = await db
    .insert(revenues)
    .values({
      companyId: body.companyId,
      description: body.description,
      category: body.category,
      amount: body.amount,
      receivedAt: body.receivedAt,
      isRecurring: body.isRecurring || false,
      partner1Share: body.partner1Share ?? 50,
      partner2Share: body.partner2Share ?? 50,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(revenue, { status: 201 });
}
