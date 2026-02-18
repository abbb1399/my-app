import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getChatglobalTag() {
  return getGlobalTag("chats");
}

export function getChatJobInfoTag(jobInfoId: string) {
  return getJobInfoTag("chats", jobInfoId);
}

export function getChatIdTag(chatId: string) {
  return getIdTag("chats", chatId);
}

export function revalidateChatCache({
  id,
  jobInfoId,
}: {
  id: string;
  jobInfoId: string;
}) {
  revalidateTag(getChatglobalTag(), "max");
  revalidateTag(getChatJobInfoTag(jobInfoId), "max");
  revalidateTag(getChatIdTag(id), "max");
}
