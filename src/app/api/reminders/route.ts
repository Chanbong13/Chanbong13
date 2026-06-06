import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importantDateSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dates = await prisma.importantDate.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Reminders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = importantDateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const date = await prisma.importantDate.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        date: new Date(parsed.data.date),
      },
    });

    return NextResponse.json({ date }, { status: 201 });
  } catch (error) {
    console.error("Reminders POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
