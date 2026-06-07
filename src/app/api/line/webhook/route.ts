import { NextResponse } from "next/server";
import { verifyLineSignature, getLineClient } from "@/lib/line";
import { estimateCalories } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface LineEvent {
  type: string;
  source: {
    type: string;
    userId?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
  replyToken?: string;
}

interface LineWebhookBody {
  events: LineEvent[];
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature") || "";

    if (!verifyLineSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body) as LineWebhookBody;
    const client = getLineClient();

    for (const event of data.events) {
      if (event.type !== "message" || event.message?.type !== "text") continue;

      const lineUserId = event.source.userId;
      const text = event.message.text?.trim() || "";
      const replyToken = event.replyToken;

      if (!lineUserId || !replyToken) continue;

      // Handle account linking BEFORE checking if user is linked
      if (text.startsWith("เชื่อมต่อ ")) {
        const code = text.replace("เชื่อมต่อ ", "").trim();
        const targetUser = await prisma.user.findUnique({ where: { id: code } });
        if (targetUser) {
          await prisma.user.update({ where: { id: code }, data: { lineUserId } });
          await client.replyMessage(replyToken, {
            type: "text",
            text: `✅ เชื่อมต่อสำเร็จ!\n\nบัญชี LINE เชื่อมต่อกับ ${targetUser.email} แล้ว 🎉\n\nลองพิมพ์ "สรุป" เพื่อดูข้อมูลวันนี้ได้เลย`,
          });
        } else {
          await client.replyMessage(replyToken, {
            type: "text",
            text: "❌ รหัสไม่ถูกต้อง กรุณาไปที่ Settings ใน LifePilot แล้วคัดลอกรหัสใหม่อีกครั้ง",
          });
        }
        continue;
      }

      const user = await prisma.user.findUnique({ where: { lineUserId } });

      if (!user) {
        await client.replyMessage(replyToken, {
          type: "text",
          text: "กรุณาเชื่อมต่อ LINE กับ LifePilot ก่อนนะ 🙏\n\n1. เข้า lifepilot-ashen.vercel.app\n2. ไปที่ Settings\n3. คัดลอกรหัสแล้วส่งมาในรูปแบบ:\n\nเชื่อมต่อ [รหัส]",
        });
        continue;
      }
      if (text.startsWith("กิน ") || text.startsWith("ทาน ") || text.match(/^(กิน|ทาน)/)) {
        const foodName = text.replace(/^(กิน|ทาน)\s*/u, "").trim();
        const calories = estimateCalories(foodName);

        await prisma.foodLog.create({
          data: {
            userId: user.id,
            foodName,
            calories,
            source: "LINE",
            date: new Date(),
          },
        });

        await client.replyMessage(replyToken, {
          type: "text",
          text: `✅ บันทึกแล้ว!\n\n🍽️ ${foodName}\n🔥 ประมาณ ${calories} kcal\n\nส่ง "สรุป" เพื่อดูยอดรวมวันนี้`,
        });
        continue;
      }

      // Handle daily summary request
      if (text === "สรุป" || text === "สรุปวันนี้" || text === "summary") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [foods, tasks, workouts] = await Promise.all([
          prisma.foodLog.findMany({
            where: { userId: user.id, date: { gte: today, lt: tomorrow } },
          }),
          prisma.task.findMany({
            where: { userId: user.id, deadline: { gte: today, lt: tomorrow } },
          }),
          prisma.workoutPlan.findMany({
            where: { userId: user.id, scheduledAt: { gte: today, lt: tomorrow } },
          }),
        ]);

        const totalCal = foods.reduce((s, f) => s + f.calories, 0);
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

        let summary = `📊 สรุปวันนี้\n\n`;
        summary += `🍽️ อาหาร: ${totalCal} kcal (${foods.length} มื้อ)\n`;
        summary += `✅ Tasks: ${completedTasks}/${tasks.length}\n`;

        if (workouts.length > 0) {
          const w = workouts[0];
          const time = new Date(w.scheduledAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          });
          summary += `💪 Workout: ${w.title} เวลา ${time}\n`;
        }

        await client.replyMessage(replyToken, { type: "text", text: summary });
        continue;
      }

      // Handle task creation
      if (text.startsWith("task:") || text.startsWith("งาน:")) {
        const title = text.replace(/^(task:|งาน:)\s*/i, "").trim();
        if (title) {
          await prisma.task.create({
            data: { userId: user.id, title, status: "PENDING", priority: "MEDIUM" },
          });
          await client.replyMessage(replyToken, {
            type: "text",
            text: `✅ เพิ่ม task แล้ว!\n\n📋 ${title}`,
          });
          continue;
        }
      }

      // Help message
      await client.replyMessage(replyToken, {
        type: "text",
        text: `สวัสดี! LifePilot พร้อมช่วยเหลือ 🌟\n\nคำสั่งที่ใช้ได้:\n• "กิน [ชื่ออาหาร]" - บันทึกแคลอรี่\n• "สรุป" - ดูสรุปวันนี้\n• "task: [ชื่องาน]" - เพิ่ม task\n\nหรือไปที่ lifepilot.app 🚀`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
