import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { revalidateChatCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertChat(
  interview: typeof InterviewTable.$inferInsert,
) {
  const [newInterview] = await db
    .insert(InterviewTable)
    .values(interview)
    .returning({ id: InterviewTable.id, jobInfoId: InterviewTable.jobInfoId });

  revalidateChatCache(newInterview);

  return newInterview;
}

export async function updateChat(
  id: string,
  interview: Partial<typeof InterviewTable.$inferInsert>,
) {
  const [newInterview] = await db
    .update(InterviewTable)
    .set(interview)
    .where(eq(InterviewTable.id, id))
    .returning({ id: InterviewTable.id, jobInfoId: InterviewTable.jobInfoId });

  revalidateChatCache(newInterview);

  return newInterview;
}
