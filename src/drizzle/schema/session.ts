import { pgEnum, pgTable, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "@/drizzle/schemaHelpers";
import { UserTable } from "./user";
import { relations } from "drizzle-orm";
import { ChatTable } from "./chat";

export const sessionStatuses = ["in_progress", "completed"] as const;
export type SessionStatus = (typeof sessionStatuses)[number];

export const SessionStatusEnum = pgEnum("session_status", sessionStatuses);

export const SessionTable = pgTable("sessions", {
  id,
  title: varchar(),
  description: varchar(),
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  status: SessionStatusEnum().notNull().default("in_progress"),
  moodRating: integer(), // 초기 또는 최종 감정 평가 (1-10)
  emotionalState: jsonb().$type<string[]>(), // ["anxious", "depressed", "happy"]
  topicTags: jsonb().$type<string[]>(), // ["work_stress", "relationships", "sleep"]
  createdAt,
  updatedAt,
});

export const sessionRelations = relations(SessionTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [SessionTable.userId],
    references: [UserTable.id],
  }),
  chats: many(ChatTable),
}));
