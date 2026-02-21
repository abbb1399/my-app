import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { NewQuestionClientPage } from "./_NewQuestionClientPage";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent sessionId={sessionId} />
    </Suspense>
  );
}

async function SuspendedComponent({ sessionId }: { sessionId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  if (!(await canCreateQuestion())) return redirect("/app/upgrade");

  const session = await getSession(sessionId, userId);
  if (session == null) return notFound();

  return <NewQuestionClientPage session={session} />;
}

async function getSession(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}
