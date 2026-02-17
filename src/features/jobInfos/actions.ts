"use server";

import { JobInfoTable } from "@/drizzle/schema";
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db";
import z from "zod";
import { jobInfoSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getJobInfoIdTag } from "./dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "생성 권한이 없습니다.",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "유효하지 않은 데이터입니다.",
    };
  }

  const jobInfo = await insertJobInfo({ ...data, userId });

  redirect(`/app/sessions/${jobInfo.id}`);
}

export async function updateJobInfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoSchema>,
) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "수정 권한이 없습니다.",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "유효하지 않은 데이터입니다.",
    };
  }

  const existingJobInfo = await getJobInfo(id, userId);

  if (existingJobInfo == null) {
    return {
      error: true,
      message: "수정 권한이 없습니다.",
    };
  }

  const jobInfo = await updateJobInfoDb(id, data);

  redirect(`/app/sessions/${jobInfo.id}`);
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
