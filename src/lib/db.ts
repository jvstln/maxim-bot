import { drizzle } from "drizzle-orm/libsql";

import { credentialsTable } from "./schema";
import { isNull, lte, or } from "drizzle-orm";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DB_FILE_NAME || "file:./local.db",
});

export const db = drizzle({ client, casing: "snake_case" });

export async function saveCredential({
  address,
  password,
  token,
}: {
  address: string;
  password: string;
  token: string;
}) {
  await db
    .insert(credentialsTable)
    .values({
      address,
      password,
      token,
    })
    .onConflictDoUpdate({
      target: credentialsTable.address,
      set: { lastUsed: new Date() },
    });
}

export async function getUnusedCredentials() {
  // Returns all credentials where last_used timestamp has lasted more than a day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return await db
    .select()
    .from(credentialsTable)
    .where(
      or(
        isNull(credentialsTable.lastUsed),
        lte(credentialsTable.lastUsed, yesterday),
      ),
    );
}
export type Credential = typeof credentialsTable.$inferSelect;
