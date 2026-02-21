import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { ChatTable } from "@/drizzle/schema";
import { getChatSessionTag } from "@/features/chats/dbCache";
import { SessionBackLink } from "@/features/sessions/components/SessionBackLink";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatters";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <SessionBackLink sessionId={sessionId} />

      <Suspense
        fallback={<Loader2Icon className="size-24 animate-spin m-auto" />}
      >
        <SuspendedPage sessionId={sessionId} />
      </Suspense>
    </div>
  );
}

async function SuspendedPage({ sessionId }: { sessionId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (userId == null) return redirectToSignIn();

  const chats = await getChats(sessionId, userId);

  if (chats.length === 0) {
    return redirect(`/app/sessions/${sessionId}/chats/new`);
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">대화들</h1>
        <Button asChild>
          <Link href={`/app/sessions/${sessionId}/chats/new`}>
            <PlusIcon />
            <span>새 대화</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        <Link
          className="transition-opacity"
          href={`/app/sessions/${sessionId}/chats/new`}
        >
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              <span>새 대화</span>
            </div>
          </Card>
        </Link>

        {chats.map((chat) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/app/sessions/${sessionId}/chats/${chat.id}`}
            key={chat.id}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <CardHeader className="gap-1 grow">
                  <CardTitle className="text-lg">
                    {formatDateTime(chat.createdAt)}
                  </CardTitle>
                  <CardDescription>{chat.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function getChats(sessionId: string, userId: string) {
  "use cache";
  cacheTag(getChatSessionTag(sessionId));
  cacheTag(getSessionIdTag(sessionId));

  const data = await db.query.ChatTable.findMany({
    where: and(
      eq(ChatTable.sessionId, sessionId),
      isNotNull(ChatTable.humeChatId),
    ),
    with: {
      session: { columns: { userId: true } },
    },
    orderBy: [desc(ChatTable.updatedAt)],
  });

  return data.filter((chat) => chat.session.userId === userId);
}
