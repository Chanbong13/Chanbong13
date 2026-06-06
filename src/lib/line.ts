import { Client, validateSignature, TextMessage, FlexMessage } from "@line/bot-sdk";

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

export function getLineClient(): Client {
  return new Client(lineConfig);
}

export function verifyLineSignature(body: string, signature: string): boolean {
  return validateSignature(body, lineConfig.channelSecret, signature);
}

export async function sendLineMessage(userId: string, message: string): Promise<void> {
  const client = getLineClient();
  const textMessage: TextMessage = {
    type: "text",
    text: message,
  };
  await client.pushMessage(userId, textMessage);
}

export async function sendMorningSummary(
  userId: string,
  taskCount: number,
  workoutTime: string | null,
  upcomingReminders: string[]
): Promise<void> {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "อรุณสวัสดิ์" : "สวัสดี";

  let message = `${greeting}! 🌅 สรุปวันนี้\n\n`;
  message += `📋 Tasks: ${taskCount} รายการที่รอทำ\n`;

  if (workoutTime) {
    message += `💪 Workout: ${workoutTime}\n`;
  }

  if (upcomingReminders.length > 0) {
    message += `\n⏰ วันนี้มีกำหนดการ:\n`;
    upcomingReminders.forEach((r) => {
      message += `• ${r}\n`;
    });
  }

  message += `\nขอให้เป็นวันที่ดี! 🌟`;

  await sendLineMessage(userId, message);
}

export async function sendEveningSummary(
  userId: string,
  completedTasks: number,
  totalTasks: number,
  caloriesConsumed: number,
  caloriesBurned: number
): Promise<void> {
  const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let message = `🌙 สรุปวันนี้\n\n`;
  message += `✅ Tasks: ${completedTasks}/${totalTasks} (${completion}%)\n`;
  message += `🍽️ Calories in: ${caloriesConsumed} kcal\n`;
  message += `🔥 Calories out: ${caloriesBurned} kcal\n`;
  message += `⚖️ Net: ${caloriesConsumed - caloriesBurned} kcal\n`;
  message += `\nพักผ่อนให้เพียงพอนะ! 😴`;

  await sendLineMessage(userId, message);
}

export async function sendTaskReminder(
  userId: string,
  taskTitle: string,
  deadline: Date
): Promise<void> {
  const timeStr = deadline.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = `⏰ แจ้งเตือน Task\n\n"${taskTitle}"\nกำหนดเสร็จ: ${timeStr}\n\nอย่าลืมทำนะ! 💪`;

  await sendLineMessage(userId, message);
}

export async function sendDateReminder(
  userId: string,
  eventTitle: string,
  daysUntil: number
): Promise<void> {
  const timeStr = daysUntil === 0 ? "วันนี้!" : daysUntil === 1 ? "พรุ่งนี้!" : `อีก ${daysUntil} วัน`;

  const message = `📅 แจ้งเตือนวันสำคัญ\n\n"${eventTitle}"\n${timeStr}\n\nอย่าลืมเตรียมตัวด้วยนะ! 🎉`;

  await sendLineMessage(userId, message);
}

export function parseCaloriesFromText(text: string): {
  foodName: string;
  estimatedCalories: number;
} | null {
  const cleanText = text.trim().toLowerCase();

  if (cleanText.startsWith("กิน ") || cleanText.startsWith("ทาน ") || cleanText.startsWith("กินข้าว") || cleanText.startsWith("ทานข้าว")) {
    const foodName = text
      .replace(/^กิน\s*/i, "")
      .replace(/^ทาน\s*/i, "")
      .trim();

    return { foodName, estimatedCalories: 0 };
  }

  return null;
}
