import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  date,
  boolean,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(),
  isPersonal: boolean("is_personal").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const revenues = pgTable("revenues", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  receivedAt: date("received_at").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  partner1Share: decimal("partner1_share", { precision: 5, scale: 2 }).default("50").notNull(),
  partner2Share: decimal("partner2_share", { precision: 5, scale: 2 }).default("50").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceDay: integer("recurrence_day"),
  paid: boolean("paid").default(false).notNull(),
  paidAt: date("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Revenue = typeof revenues.$inferSelect;
export type NewRevenue = typeof revenues.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
