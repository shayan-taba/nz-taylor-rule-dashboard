import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  const regimes = await db.regimeDefinition.findMany({
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(regimes);
}