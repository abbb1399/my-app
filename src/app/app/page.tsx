import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { SessionTable } from "@/drizzle/schema";
import { SessionForm } from "@/features/sessions/components/SessionForm";
import { getSessionUserTag } from "@/features/sessions/dbCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { desc, eq } from "drizzle-orm";
import { ArrowRightIcon, Loader2, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2 className="size-24 animate-spin" />
        </div>
      }
    >
      <SessionInfos />
    </Suspense>
  );
}

async function SessionInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();

  if (userId == null) return redirectToSignIn();

  const jobInfos = await getSessions(userId);

  if (jobInfos.length === 0) {
    return <NoSessionInfos />;
  }

  return (
    <div className="container my-4">
      <div className="flex gap-2 justify-between mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">나의 상담들</h1>
        <Button asChild>
          <Link href="/app/sessions/new">
            <PlusIcon />
            상담 생성하기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((jobInfo) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/app/sessions/${jobInfo.id}`}
            key={jobInfo.id}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-4 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{jobInfo.title ?? "제목 없음"}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground line-clamp-3">
                    {jobInfo.description}
                  </CardContent>
                  <CardFooter className="flex gap-2 flex-wrap">
                    {jobInfo.title && (
                      <Badge variant="outline">{jobInfo.title}</Badge>
                    )}
                    {jobInfo.moodRating != null && (
                      <Badge variant="outline">기분 {jobInfo.moodRating}/10</Badge>
                    )}
                    {(jobInfo.topicTags ?? []).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </CardFooter>
                </div>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}

        <Link className="transition-opacity" href="/app/sessions/new">
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              상담 생성하기
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function NoSessionInfos() {
  return (
    <div className="container my-4 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">환영합니다.</h1>
      <p className="text-muted-foreground mb-8">
        시작하려면, 정보를 입력해주세요. 상세 정보를 바탕으로 최적의 준비를
        도와드립니다.
      </p>
      <Card>
        <CardContent>
          <SessionForm />
        </CardContent>
      </Card>
    </div>
  );
}

async function getSessions(userId: string) {
  "use cache";
  cacheTag(getSessionUserTag(userId));

  return db.query.SessionTable.findMany({
    where: eq(SessionTable.userId, userId),
    orderBy: desc(SessionTable.createdAt),
  });
}
