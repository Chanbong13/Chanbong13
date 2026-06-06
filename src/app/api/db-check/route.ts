import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function redactUrl(url: string | undefined) {
  if (!url) return "(not set)";
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username ? "***" : ""}@${u.host}${u.pathname}${u.search}`;
  } catch {
    return url.slice(0, 30) + "...";
  }
}

export async function GET() {
  const dbUrl = redactUrl(process.env.DATABASE_URL);
  const directUrl = redactUrl(process.env.DATABASE_URL_DIRECT);
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount, database: "connected", dbUrl, directUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg, dbUrl, directUrl }, { status: 500 });
  }
}
