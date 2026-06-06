import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { healthLogSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    const now = new Date();
    const from = new Date();
    if (period === "week") from.setDate(from.getDate() - 7);
    else if (period === "month") from.setMonth(from.getMonth() - 1);
    else if (period === "year") from.setFullYear(from.getFullYear() - 1);

    const logs = await prisma.healthLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: from, lte: now },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Health GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = healthLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const log = await prisma.healthLog.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Health POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
