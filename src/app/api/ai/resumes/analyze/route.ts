import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function POST(req: Request) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("로그인하지 않았습니다.", { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("10mb를 초과하였습니다.", { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("PDF, Word, Text 파일을 업로드해주세요.", {
      status: 400,
    });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("권한이 없습니다.", {
      status: 403,
    });
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const res = await analyzeResumeForJob({
    resumeFile,
    jobInfo,
  });

  return res.toTextStreamResponse();
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}
