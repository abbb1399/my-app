"use server";

import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { and, eq } from "drizzle-orm";
import { insertChat, updateChat as updateChatDb } from "./db";
import { getChatIdTag } from "./dbCache";
import { canCreateChat } from "./permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";

export async function createChat({
  jobInfoId,
}: {
  jobInfoId: string;
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

  const jobInfo = await getJobInfo(jobInfoId, userId);

  if (jobInfo == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  const interview = await insertChat({
    jobInfoId,
    duration: "00:00:00",
  });

  return { error: false, id: interview.id };
}

export async function updateChat(
  id: string,
  data: { humeChatId?: string; duration?: string },
) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  const interview = await getChat(id, userId);

  if (interview == null) {
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

  const interview = await getChat(chatId, userId);

  if (interview == null) {
    return {
      error: true,
      message: "권한이 없습니다.",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "대화가 아직 완료되지 않았습니다.",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
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

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getChat(id: string, userId: string) {
  "use cache";
  cacheTag(getChatIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getSessionIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
