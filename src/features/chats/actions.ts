"use server";

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { db } from "@/drizzle/db";
import { ChatTable, SessionTable } from "@/drizzle/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { and, eq } from "drizzle-orm";
import { insertChat, updateChat as updateChatDb } from "./db";
import { getChatIdTag } from "./dbCache";
import { canCreateChat } from "./permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";

export async function createChat({
  sessionId,
}: {
  sessionId: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  if (!(await canCreateChat())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    };
  }

  const session = await getSession(sessionId, userId);

  if (session == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  const chat = await insertChat({
    sessionId,
    duration: 0,
  });

  return { error: false, id: chat.id };
}

export async function updateChat(
  id: string,
  data: { humeChatId?: string; duration?: number },
) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  const chat = await getChat(id, userId);

  if (chat == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  await updateChatDb(id, data);

  return { error: false };
}

export async function generateInterviewFeedback(chatId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null || user == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  const chat = await getChat(chatId, userId);

  if (chat == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  if (chat.humeChatId == null) {
    return {
      error: true,
      message: "대화가 아직 완료되지 않았습니다.",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: chat.humeChatId,
    session: chat.session,
    userName: user.name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "피드백 생성에 실패 했습니다.",
    };
  }

  await updateChatDb(chatId, { feedback });

  return { error: false };
}

async function getSession(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}

async function getChat(id: string, userId: string) {
  "use cache";
  cacheTag(getChatIdTag(id));

  const chat = await db.query.ChatTable.findFirst({
    where: eq(ChatTable.id, id),
    with: {
      session: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
        },
      },
    },
  });

  if (chat == null) return null;

  cacheTag(getSessionIdTag(chat.session.id));
  if (chat.session.userId !== userId) return null;

  return chat;
}
