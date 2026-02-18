import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { revalidateSessionCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertSession(jobInfo: typeof SessionTable.$inferInsert) {
  const [newJobInfo] = await db.insert(SessionTable).values(jobInfo).returning({
    id: SessionTable.id,
    userId: SessionTable.userId,
  });

  revalidateSessionCache(newJobInfo);

  return newJobInfo;
}

export async function updateSession(
  id: string,
  jobInfo: Partial<typeof SessionTable.$inferInsert>,
) {
  const [updatedJobInfo] = await db
    .update(SessionTable)
    .set(jobInfo)
    .where(eq(SessionTable.id, id))
    .returning({
      id: SessionTable.id,
      userId: SessionTable.userId,
    });

  revalidateSessionCache(updatedJobInfo);

  return updatedJobInfo;
}
