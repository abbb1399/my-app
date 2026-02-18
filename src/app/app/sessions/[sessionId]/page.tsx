import { BackLink } from "@/components/BackLink";
import { Skeleton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { getSessionIdTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { ArrowRightIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";

const options = [
  {
    label: "기술 질문 답변하기",
    description: "직무 설명에 맞는 기술 질문을 풀어보세요.",
    href: "questions",
  },
  {
    label: "상담하기",
    description: "상담사와 대화해보세요.",
    href: "chats",
  },
  {
    label: "이력서 수정하기",
    description: "이력서에 대한 전문가 피드백을 받아 면접 준비를 더 잘하세요.",
    href: "resume",
  },
  {
    label: "상담 정보 수정하기",
    description: "소소한 수정은 이 페이지에서 할 수 있습니다.",
    href: "edit",
  },
];

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInfo = await getJobInfo(sessionId, userId);

      if (jobInfo == null) notFound();

      return jobInfo;
    },
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/app">나의 상담들</BackLink>

      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl">
              <SuspendedItem
                item={jobInfo}
                fallback={<Skeleton className="w-48" />}
                result={(j) => j.title ?? "제목 없음"}
              />
            </h1>
            <div className="flex gap-2 flex-wrap">
              <SuspendedItem
                item={jobInfo}
                fallback={null}
                result={(j) =>
                  j.moodRating != null ? (
                    <Badge variant="secondary">기분 {j.moodRating}/10</Badge>
                  ) : null
                }
              />
              <SuspendedItem
                item={jobInfo}
                fallback={null}
                result={(j) =>
                  j.title ? (
                    <Badge variant="secondary">{j.title}</Badge>
                  ) : null
                }
              />
              <SuspendedItem
                item={jobInfo}
                fallback={null}
                result={(j) =>
                  (j.topicTags ?? []).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))
                }
              />
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-3">
            <SuspendedItem
              item={jobInfo}
              fallback={<Skeleton className="w-96" />}
              result={(j) => j.description}
            />
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((option) => (
            <Link
              className="hover:scale-[1.02] transition-[transform_opacity]"
              href={`/app/sessions/${sessionId}/${option.href}`}
              key={option.href}
            >
              <Card className="h-full flex items-start justify-between flex-row">
                <CardHeader className="grow">
                  <CardTitle>{option.label}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getSessionIdTag(id));

  return db.query.SessionTable.findFirst({
    where: and(eq(SessionTable.id, id), eq(SessionTable.userId, userId)),
  });
}
