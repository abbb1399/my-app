import { ExperienceLevel } from "@/drizzle/schema";

export function formatExperienceLevel(level: ExperienceLevel) {
  switch (level) {
    case "junior":
      return "주니어";
    case "mid-level":
      return "미들";
    case "senior":
      return "시니어";
    default:
      throw new Error(`유효하지 않은 경험 레벨: ${level satisfies never}`);
  }
}
