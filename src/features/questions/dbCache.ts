import { getGlobalTag, getIdTag, getSessionTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getQuestionGlobalTag() {
  return getGlobalTag("questions");
}

export function getQuestionSessionTag(sessionId: string) {
  return getSessionTag("questions", sessionId);
}

export function getQuestionIdTag(id: string) {
  return getIdTag("questions", id);
}

export function revalidateQuestionCache({
  id,
  sessionId,
}: {
  id: string;
  sessionId: string;
}) {
  revalidateTag(getQuestionGlobalTag(), "max");
  revalidateTag(getQuestionSessionTag(sessionId), "max");
  revalidateTag(getQuestionIdTag(id), "max");
}
