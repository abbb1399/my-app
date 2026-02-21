import { BackLink } from "@/components/BackLink";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Skeleton, SkeletonButton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/drizzle/db";
import { ChatTable } from "@/drizzle/schema";
import { getChatIdTag } from "@/features/chats/dbCache";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { formatDateTime } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { CondensedMessages } from "@/services/hume/components/CondensedMessages";
import { fetchChatMessages } from "@/services/hume/lib/api";
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages";
import { eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { generateInterviewFeedback } from "@/features/chats/actions";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string; chatId: string }>;
}) {
  const { sessionId, chatId } = await params;

  const interview = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const interview = await getChats(chatId, userId);
      if (interview == null) return notFound();

      return interview;
    },
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href={`/app/sessions/${sessionId}/chats`}>모든 대화들</BackLink>

      <div className="space-y-6">
        <div className="flex gap-2 justify-between">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl">
              대화:{" "}
              <SuspendedItem
                item={interview}
                fallback={<Skeleton className="w-48" />}
                result={(i) => formatDateTime(i.createdAt)}
              />
            </h1>
            <p className="text-muted-foreground">
              <SuspendedItem
                item={interview}
                fallback={<Skeleton className="w-24" />}
                result={(i) => i.duration}
              />
            </p>
          </div>

          <SuspendedItem
            item={interview}
            fallback={<SkeletonButton className="w-32" />}
            result={(i) =>
              i.feedback == null ? (
                <ActionButton
                  action={generateInterviewFeedback.bind(null, i.id)}
                >
                  피드백 생성하기
                </ActionButton>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>피드백 보기</Button>
                  </DialogTrigger>
                  <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
                    <DialogTitle>피드백</DialogTitle>
                    <MarkdownRenderer>{i.feedback}</MarkdownRenderer>
                  </DialogContent>
                </Dialog>
              )
            }
          />
        </div>

        <Suspense
          fallback={<Loader2 className="animate-spin size-24 mx-auto" />}
        >
          <Messages interview={interview} />
        </Suspense>
      </div>
    </div>
  );
}

async function Messages({
  interview,
}: {
  interview: Promise<{ humeChatId: string | null }>;
}) {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true });
  if (user == null) return redirectToSignIn();
  const { humeChatId } = await interview;
  if (humeChatId == null) return notFound();

  const condensedMessages = condenseChatMessages(
    await fetchChatMessages(humeChatId),
  );

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={user}
      className="max-w-5xl mx-auto"
    />
  );
}

async function getChats(id: string, userId: string) {
  "use cache";
  cacheTag(getChatIdTag(id));

  const interview = await db.query.ChatTable.findFirst({
    where: eq(ChatTable.id, id),
    with: { session: { columns: { id: true, userId: true } } },
  });

  if (interview == null) return null;

  cacheTag(getSessionIdTag(interview.session.id));
  if (interview.session.userId !== userId) return null;

  return interview;
}
