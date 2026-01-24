import { QuestionDifficulty } from "@/drizzle/schema";

export function formatQuestionDifficulty(difficulty: QuestionDifficulty) {
  switch (difficulty) {
    case "easy":
      return "쉬움";
    case "medium":
      return "보통";
    case "hard":
      return "어려움";
    default:
      throw new Error(`정의되지 않은 난이도: ${difficulty}`);
  }
}
