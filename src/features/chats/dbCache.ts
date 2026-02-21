import { getGlobalTag, getIdTag, getSessionTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getChatglobalTag() {
  return getGlobalTag("chats");
}

export function getChatSessionTag(sessionId: string) {
  return getSessionTag("chats", sessionId);
}

export function getChatIdTag(chatId: string) {
  return getIdTag("chats", chatId);
}

export function revalidateChatCache({
  id,
  sessionId,
}: {
  id: string;
  sessionId: string;
}) {
  revalidateTag(getChatglobalTag(), "max");
  revalidateTag(getChatSessionTag(sessionId), "max");
  revalidateTag(getChatIdTag(id), "max");
}
