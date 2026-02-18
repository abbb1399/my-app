import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from "@/drizzle/schemaHelpers";
import { SessionTable } from "./session";
import { relations } from "drizzle-orm";

export const ChatTable = pgTable("chats", {
  id,
  jobInfoId: uuid()
    .references(() => SessionTable.id, { onDelete: "cascade" })
    .notNull(),
  duration: varchar().notNull(),
  humeChatId: varchar(),
  feedback: varchar(),
  createdAt,
  updatedAt,
});

export const interviewRelations = relations(ChatTable, ({ one }) => ({
  jobInfo: one(SessionTable, {
    fields: [ChatTable.jobInfoId],
    references: [SessionTable.id],
  }),
}));
