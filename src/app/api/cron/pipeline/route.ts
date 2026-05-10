import { NextRequest, NextResponse } from "next/server";
import { runFullPipeline } from "../../../../lib/pipeline";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runFullPipeline();
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[cron] Pipeline error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}