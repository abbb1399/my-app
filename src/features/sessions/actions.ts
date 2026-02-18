"use server";

import { SessionTable } from "@/drizzle/schema";
import { insertSession, updateSession as updateSessionDb } from "./db";
import z from "zod";
import { sessionSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { cacheTag } from "next/cache";
import { getSessionIdTag } from "./dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

export async function createSession(unsafeData: z.infer<typeof sessionSchema>) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "생성 권한이 없습니다.",
    };
  }

  const { success, data } = sessionSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "유효하지 않은 데이터입니다.",
    };
  }

  const jobInfo = await insertSession({ ...data, userId });

  redirect(`/app/sessions/${jobInfo.id}`);
}

export async function updateSession(
  id: string,
  unsafeData: z.infer<typeof sessionSchema>,
) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return {
      error: true,
      message: "수정 권한이 없습니다.",
    };
  }

  const { success, data } = sessionSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "유효하지 않은 데이터입니다.",
    };
  }

  const existingJobInfo = await updateSessionInfo(id, userId);

  if (existingJobInfo == null) {
    return {
      error: true,
      message: "수정 권한이 없습니다.",
    };
  }

  const jobInfo = await updateSessionDb(id, data);

  redirect(`/app/sessions/${jobInfo.id}`);
}

async function updateSessionInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}
