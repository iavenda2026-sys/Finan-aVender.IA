import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  const existing = await db.select().from(companies);
  if (existing.length > 0) {
    return NextResponse.json({ message: "Seed já aplicado" });
  }

  await db.insert(companies).values([
    {
      name: "Vender.IA",
      description: "Inteligência Comercial Automatizada",
      color: "#3b82f6",
      isPersonal: false,
      active: true,
    },
    {
      name: "Gastos Pessoais",
      description: "Despesas pessoais dos sócios",
      color: "#10b981",
      isPersonal: true,
      active: true,
    },
  ]);

  return NextResponse.json({ message: "Seed aplicado com sucesso" });
}
