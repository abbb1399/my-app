import { db } from "@/drizzle/db";
import {
  SessionTable,
  questionDifficulties,
  QuestionTable,
} from "@/drizzle/schema";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { insertQuestion } from "@/features/questions/db";
import { getQuestionJobInfoTag } from "@/features/questions/dbCache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { generateAiQuestion } from "@/services/ai/questions";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { and, asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("질문 생성 실패", { status: 400 });
  }

  const { prompt: difficulty, jobInfoId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("로그인 하지 않았습니다.", { status: 401 });
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("권한이 없습니다.", {
      status: 403,
    });
  }

  const previousQuestions = await getQuestions(jobInfoId);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const streamResult = generateAiQuestion({
        previousQuestions,
        jobInfo,
        difficulty,
        onFinish: async (question) => {
          const { id } = await insertQuestion({
            text: question,
            jobInfoId,
            difficulty,
          });

          writer.write({
            type: "data-question",
            data: { questionId: id },
          });
        },
      });

      writer.merge(streamResult.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}

async function getQuestions(jobInfoId: string) {
  "use cache";
  cacheTag(getQuestionJobInfoTag(jobInfoId));

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  });
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}
