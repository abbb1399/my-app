import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export const PLAN_LIMIT_MESSAGE = "PLAN_LIMIT";
export const RATE_LIMIT_MESSAGE = "RATE_LIMIT";

export function errorToast(message: string) {
  if (message === PLAN_LIMIT_MESSAGE) {
    const toastId = toast.error("Plan Limit에 도달했습니다.", {
      action: (
        <Button
          size="sm"
          asChild
          onClick={() => {
            toast.dismiss(toastId);
          }}
        >
          <Link href="/app/upgrade">업그레이드</Link>
        </Button>
      ),
    });
    return;
  }

  if (message === RATE_LIMIT_MESSAGE) {
    toast.error("잠시 후 다시 시도해주세요.", {
      description: "너무 많은 요청이 감지되었습니다. 다시 시도해주세요.",
    });
    return;
  }

  toast.error(message);
}
