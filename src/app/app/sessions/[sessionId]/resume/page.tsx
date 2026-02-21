import { SessionBackLink } from "@/features/sessions/components/SessionBackLink";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ResumePageClient } from "./_client";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <SessionBackLink sessionId={sessionId} />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ sessionId }: { sessionId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade");

  return <ResumePageClient sessionId={sessionId} />;
}
