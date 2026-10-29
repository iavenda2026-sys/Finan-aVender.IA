import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "all") as "all" | "month" | "year" | "custom";
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  return NextResponse.json(await getDashboardData({ period, startDate, endDate }));

}
