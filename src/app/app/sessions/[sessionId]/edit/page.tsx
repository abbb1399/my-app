import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { SessionBackLink } from "@/features/sessions/components/SessionBackLink";
import { SessionForm } from "@/features/sessions/components/SessionForm";
import { getJobInfoIdTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function JobInfoNewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <SessionBackLink jobInfoId={jobInfoId} />
      <h1 className="text-3xl md:text-4xl">직무 정보 수정</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <SessionForm jobInfo={jobInfo} />;
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId!)),
  });
}
