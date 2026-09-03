import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const [expense] = await db
    .update(expenses)
    .set({
      companyId: body.companyId,
      description: body.description,
      category: body.category,
      amount: body.amount,
      dueDate: body.dueDate,
      isRecurring: body.isRecurring,
      recurrenceDay: body.recurrenceDay,
      paid: body.paid,
      paidAt: body.paidAt,
      notes: body.notes,
    })
    .where(eq(expenses.id, id))
    .returning();
  return NextResponse.json(expense);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(expenses).where(eq(expenses.id, id));
  return NextResponse.json({ success: true });
}
