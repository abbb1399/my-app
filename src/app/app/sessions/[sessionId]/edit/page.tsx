import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { SessionBackLink } from "@/features/sessions/components/SessionBackLink";
import { SessionForm } from "@/features/sessions/components/SessionForm";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function SessionNewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <SessionBackLink sessionId={sessionId} />
      <h1 className="text-3xl md:text-4xl">상담 정보 수정</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspendedForm jobInfoId={sessionId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const session = await getSession(jobInfoId, userId);
  if (session == null) return notFound();

  return <SessionForm session={session} />;
}

async function getSession(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId!)),
  });
}
