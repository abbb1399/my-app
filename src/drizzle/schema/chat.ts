import { pgTable, uuid, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from "@/drizzle/schemaHelpers";
import { SessionTable } from "./session";
import { relations } from "drizzle-orm";

export const ChatTable = pgTable("chats", {
  id,
  sessionId: uuid()
    .references(() => SessionTable.id, { onDelete: "cascade" })
    .notNull(),
  humeChatId: varchar(),
  duration: integer(),
  moodRating: integer(),
  emotionalState: jsonb().$type<string[]>(),
  feedback: varchar(),
  createdAt,
  updatedAt,
});

export const chatRelations = relations(ChatTable, ({ one }) => ({
  session: one(SessionTable, {
    fields: [ChatTable.sessionId],
    references: [SessionTable.id],
  }),
}));
