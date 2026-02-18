import { BackLink } from "@/components/BackLink";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { Suspense } from "react";
import { getSessionIdTag } from "../dbCache";

export function SessionBackLink({
  sessionId,
  className,
}: {
  sessionId: string;
  className?: string;
}) {
  return (
    <BackLink
      href={`/app/sessions/${sessionId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback={"업무 설명"}>
        <JobName sessionId={sessionId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({ sessionId }: { sessionId: string }) {
  const jobInfo = await getJobInfo(sessionId);
  return jobInfo?.name ?? "업무 설명";
}

async function getJobInfo(id: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: eq(JobInfoTable.id, id),
  });
}
