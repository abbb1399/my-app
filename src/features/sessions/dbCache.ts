import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getSessionGlobalTag() {
  return getGlobalTag("sessions");
}

export function getSessionUserTag(userId: string) {
  return getUserTag("sessions", userId);
}

export function getSessionIdTag(sessionId: string) {
  return getIdTag("sessions", sessionId);
}

export function revalidateSessionCache({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  revalidateTag(getSessionGlobalTag(), "max");
  revalidateTag(getSessionUserTag(userId), "max");
  revalidateTag(getSessionIdTag(id), "max");
}
