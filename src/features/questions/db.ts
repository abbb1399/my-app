import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";
import { revalidateQuestionCache } from "./dbCache";

export async function insertQuestion(
  question: typeof QuestionTable.$inferInsert,
) {
  const [newQuestion] = await db
    .insert(QuestionTable)
    .values(question)
    .returning({
      id: QuestionTable.id,
      sessionId: QuestionTable.sessionId,
    });

  revalidateQuestionCache({
    id: newQuestion.id,
    sessionId: newQuestion.sessionId,
  });

  return newQuestion;
}
