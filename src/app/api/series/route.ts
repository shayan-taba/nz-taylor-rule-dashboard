import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const data = await db.quarterlyData.findMany({
    where: {
      date: {
        gte: startDate ? new Date(startDate) : new Date("2000-01-01"),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(data);
}