import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workoutPlanSchema } from "@/lib/validations";

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

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: session.user.id, scheduledAt: { gte: from } },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Workout GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = workoutPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        scheduledAt: new Date(parsed.data.scheduledAt),
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Workout POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
