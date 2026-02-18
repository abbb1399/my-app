import { z } from "zod";

export const sessionSchema = z.object({
  title: z.string().min(1).nullable(),
  description: z.string().nullable(),
  moodRating: z.number().int().min(1).max(10).nullable(),
  emotionalState: z.array(z.string()).nullable(),
  topicTags: z.array(z.string()).nullable(),
});
