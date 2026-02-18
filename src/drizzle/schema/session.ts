import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "@/drizzle/schemaHelpers";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";
import { InterviewTable } from "./interview";
import { QuestionTable } from "./question";

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const ExperienceLevelEnum = pgEnum(
  "session_experience_level",
  experienceLevels,
);

export const SessionTable = pgTable("session", {
  id,
  title: varchar(),
  name: varchar().notNull(),
  experienceLevel: ExperienceLevelEnum().notNull(),
  description: varchar().notNull(),
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
});

export const sessionRelations = relations(SessionTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [SessionTable.userId],
    references: [UserTable.id],
  }),
  questions: many(QuestionTable),
  interviews: many(InterviewTable),
}));
