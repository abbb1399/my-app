import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobInfoGlobalTag() {
  return getGlobalTag("jobInfos");
}

export function getJobInfoUserTag(userId: string) {
  return getUserTag("jobInfos", userId);
}

export function getJobInfoIdTag(jobInfoId: string) {
  return getIdTag("jobInfos", jobInfoId);
}

export function revalidateJobInfoCache({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  revalidateTag(getJobInfoGlobalTag(), "max");
  revalidateTag(getJobInfoUserTag(userId), "max");
  revalidateTag(getJobInfoIdTag(id), "max");
}
