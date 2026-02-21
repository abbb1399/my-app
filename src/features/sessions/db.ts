import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { revalidateSessionCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertSession(session: typeof SessionTable.$inferInsert) {
  const [newSession] = await db.insert(SessionTable).values(session).returning({
    id: SessionTable.id,
    userId: SessionTable.userId,
  });

  revalidateSessionCache(newSession);

  return newSession;
}

export async function updateSession(
  id: string,
  session: Partial<typeof SessionTable.$inferInsert>,
) {
  const [updatedSession] = await db
    .update(SessionTable)
    .set(session)
    .where(eq(SessionTable.id, id))
    .returning({
      id: SessionTable.id,
      userId: SessionTable.userId,
    });

  revalidateSessionCache(updatedSession);

  return updatedSession;
}
