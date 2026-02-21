import { db } from "@/drizzle/db";
import { ChatTable } from "@/drizzle/schema";
import { revalidateChatCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertChat(interview: typeof ChatTable.$inferInsert) {
  const [newInterview] = await db
    .insert(ChatTable)
    .values(interview)
    .returning({ id: ChatTable.id, sessionId: ChatTable.sessionId });

  revalidateChatCache(newInterview);

  return newInterview;
}

export async function updateChat(
  id: string,
  interview: Partial<typeof ChatTable.$inferInsert>,
) {
  const [newInterview] = await db
    .update(ChatTable)
    .set(interview)
    .where(eq(ChatTable.id, id))
    .returning({ id: ChatTable.id, sessionId: ChatTable.sessionId });

  revalidateChatCache(newInterview);

  return newInterview;
}
