import { PricingTable } from "@/services/clerk/components/PricingTable";
import { BackLink } from "@/components/BackLink";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UpgradePage() {
  return (
    <div className="container py-4 max-w-6xl">
      <div className="mb-4">
        <BackLink href="/app">Dashboard</BackLink>
      </div>

      <div className="space-y-16">
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>한도에 도달 했습니다.</AlertTitle>
          <AlertDescription>
            할당된 한도에 도달하였습니다. 업그레이드하여 계속 사용해주세요.
          </AlertDescription>
        </Alert>

        <PricingTable />
      </div>
    </div>
  );
}
