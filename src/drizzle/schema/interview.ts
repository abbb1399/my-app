import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from "@/drizzle/schemaHelpers";
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const InterviewTable = pgTable("interviews", {
  id,
  jobInfoId: uuid()
    .references(() => JobInfoTable.id, { onDelete: "cascade" })
    .notNull(),
  duration: varchar().notNull(),
  humeChatId: varchar(),
  feedback: varchar(),
  createdAt,
  updatedAt,
});

export const interviewRelations = relations(InterviewTable, ({ one }) => ({
  jobInfo: one(JobInfoTable, {
    fields: [InterviewTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
}));
