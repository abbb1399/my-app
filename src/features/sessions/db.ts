import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { revalidateSessionCache } from "./dbCache";
import { eq } from "drizzle-orm";

export async function insertSession(jobInfo: typeof JobInfoTable.$inferInsert) {
  const [newJobInfo] = await db.insert(JobInfoTable).values(jobInfo).returning({
    id: JobInfoTable.id,
    userId: JobInfoTable.userId,
  });

  revalidateSessionCache(newJobInfo);

  return newJobInfo;
}

export async function updateSession(
  id: string,
  jobInfo: Partial<typeof JobInfoTable.$inferInsert>,
) {
  const [updatedJobInfo] = await db
    .update(JobInfoTable)
    .set(jobInfo)
    .where(eq(JobInfoTable.id, id))
    .returning({
      id: JobInfoTable.id,
      userId: JobInfoTable.userId,
    });

  revalidateSessionCache(updatedJobInfo);

  return updatedJobInfo;
}
