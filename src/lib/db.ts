import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DB_FILE_NAME || "file:./local.db",
});
const db = drizzle({ client });

import { credentialsTable } from "./schema";
import { eq, gt, gte, isNull, lte, or } from "drizzle-orm";

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
      set: { last_used: new Date() },
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
        isNull(credentialsTable.last_used),
        lte(credentialsTable.last_used, yesterday),
      ),
    );
}
