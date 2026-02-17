import { experienceLevels } from "@/drizzle/schema";
import { z } from "zod";

export const sessionSchema = z.object({
  name: z.string().min(1, "필수 입력 항목입니다."),
  title: z.string().min(1).nullable(),
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, "필수 입력 항목입니다."),
});
