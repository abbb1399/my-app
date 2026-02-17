import { BackLink } from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { SessionForm } from "@/features/sessions/components/SessionForm";

export default function JobInfoNewPage() {
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href="/app">나의 상담들</BackLink>
      <h1 className="text-3xl md:text-4xl">상담 생성하기</h1>

      <Card>
        <CardContent>
          <SessionForm />
        </CardContent>
      </Card>
    </div>
  );
}
