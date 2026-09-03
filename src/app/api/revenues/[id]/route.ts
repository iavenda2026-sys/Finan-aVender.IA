import { NextResponse } from "next/server";
import { db } from "@/db";
import { revenues } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const [revenue] = await db
    .update(revenues)
    .set({
      companyId: body.companyId,
      description: body.description,
      category: body.category,
      amount: body.amount,
      receivedAt: body.receivedAt,
      isRecurring: body.isRecurring,
      partner1Share: body.partner1Share,
      partner2Share: body.partner2Share,
      notes: body.notes,
    })
    .where(eq(revenues.id, id))
    .returning();
  return NextResponse.json(revenue);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(revenues).where(eq(revenues.id, id));
  return NextResponse.json({ success: true });
}
