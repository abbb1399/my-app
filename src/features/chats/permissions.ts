import { db } from "@/drizzle/db";
import { InterviewTable, SessionTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/hasPermission";
import { and, count, eq, isNotNull } from "drizzle-orm";

export async function canCreateChat() {
  return await Promise.any([
    hasPermission("unlimited_interviews").then(
      (bool) => bool || Promise.reject(),
    ),

    Promise.all([hasPermission("1_interview"), getUserChatCount()]).then(
      ([has, c]) => {
        if (has && c < 1) return true;
        return Promise.reject();
      },
    ),
  ]).catch(() => false);
}

async function getUserChatCount() {
  const { userId } = await getCurrentUser();
  if (userId == null) return 0;

  return getChatCount(userId);
}

async function getChatCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(SessionTable, eq(InterviewTable.jobInfoId, SessionTable.id))
    .where(
      and(
        eq(SessionTable.userId, userId),
        isNotNull(InterviewTable.humeChatId),
      ),
    );

  return c;
}
