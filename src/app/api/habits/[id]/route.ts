import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date: today } },
    });

    if (existingLog) {
      await prisma.habitLog.delete({ where: { id: existingLog.id } });
      return NextResponse.json({ completed: false });
    } else {
      await prisma.habitLog.create({
        data: { habitId: id, userId: session.user.id, date: today },
      });
      return NextResponse.json({ completed: true });
    }
  } catch (error) {
    console.error("Habit toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.habit.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

    await prisma.habit.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Habit DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
