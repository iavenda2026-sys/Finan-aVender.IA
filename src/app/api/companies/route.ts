import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allCompanies = await db
    .select()
    .from(companies)
    .orderBy(desc(companies.createdAt));
  return NextResponse.json(allCompanies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [company] = await db
    .insert(companies)
    .values({
      name: body.name,
      description: body.description,
      color: body.color || "#3b82f6",
      isPersonal: body.isPersonal || false,
      active: true,
    })
    .returning();
  return NextResponse.json(company, { status: 201 });
}
