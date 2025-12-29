import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/drizzle/schemaHelpers";
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const UserTable = pgTable("users", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  imageUrl: varchar().notNull(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(UserTable, ({ many }) => ({
  jobInfos: many(JobInfoTable),
}));
