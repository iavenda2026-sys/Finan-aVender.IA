import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const [company] = await db
    .update(companies)
    .set({
      name: body.name,
      description: body.description,
      color: body.color,
      isPersonal: body.isPersonal,
      active: body.active,
    })
    .where(eq(companies.id, id))
    .returning();
  return NextResponse.json(company);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(companies).where(eq(companies.id, id));
  return NextResponse.json({ success: true });
}
