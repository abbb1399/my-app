import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "@/drizzle/schemaHelpers";
import { SessionTable } from "./session";
import { relations } from "drizzle-orm";

export const questionDifficulties = ["easy", "medium", "hard"] as const;
export type QuestionDifficulty = (typeof questionDifficulties)[number];

export const QuestionDifficultyEnum = pgEnum(
  "questions_question_difficulty",
  questionDifficulties,
);

export const QuestionTable = pgTable("questions", {
  id,
  sessionId: uuid()
    .references(() => SessionTable.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar().notNull(),
  difficulty: QuestionDifficultyEnum().notNull(),
  createdAt,
  updatedAt,
});

export const questionRelations = relations(QuestionTable, ({ one }) => ({
  session: one(SessionTable, {
    fields: [QuestionTable.sessionId],
    references: [SessionTable.id],
  }),
}));
