import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { fetchAccessToken } from "hume";
import { env } from "@/data/env/server";
import { VoiceProvider } from "@humeai/voice-react";
import { StartCall } from "./_StartCall";
import { canCreateChat } from "@/features/chats/permissions";

export default async function ChatsNewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="h-screen-header flex items-center justify-center">
      <Suspense fallback={<Loader2 className="size-24 animate-spin" />}>
        <SuspendedComponent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ sessionId }: { sessionId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });

  if (userId == null || user == null) return redirectToSignIn();

  if (!(await canCreateChat())) return redirect("/app/upgrade");

  const jobInfo = await getJobInfo(sessionId, userId);

  if (jobInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: env.HUME_API_KEY,
    secretKey: env.HUME_SECRET_KEY,
  });

  return (
    <VoiceProvider>
      <StartCall jobInfo={jobInfo} user={user} accessToken={accessToken} />
    </VoiceProvider>
  );
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
