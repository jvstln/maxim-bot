import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const credentialsTable = sqliteTable("credentials", {
  id: int().primaryKey({ autoIncrement: true }),
  address: text().notNull().unique(),
  password: text().notNull(),
  token: text().notNull(),
  lastUsed: int({ mode: "timestamp_ms" }).$defaultFn(() => new Date()),
});
