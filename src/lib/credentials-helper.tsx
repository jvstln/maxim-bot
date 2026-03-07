import fs from "node:fs/promises";
import path from "node:path";
import z from "zod";

const credentialsSchema = z.array(
  z.object({
    address: z.email(),
    password: z.string().min(1),
    token: z.string().min(1),
  }),
);

// import.meta.dirname is src/lib, so we go two levels up to reach the project root
const BASE_DIR = path.join(import.meta.dirname, "../../");

const getCredentialsFilePath = (date: Date) => {
  return path.join(
    BASE_DIR,
    `credentials-${date.toISOString().split("T")[0]}.txt`,
  );
};

export async function getCredentialsByDate(date = new Date()) {
  const filePath = getCredentialsFilePath(date);
  let content = await fs.readFile(filePath, "utf-8");
  const credentials = content
    .trim()
    .split(/\r?\n/)
    .map((rawCrendentials) => {
      const rc = rawCrendentials.split(" -- ");
      return { address: rc[0], password: rc[1], token: rc[2] };
    });

  return credentialsSchema.parse(credentials);
}

export async function saveCredentials(data: string, date = new Date()) {
  const filePath = getCredentialsFilePath(date);
  await fs.writeFile(filePath, data, "utf-8");
}

console.log((await getCredentialsByDate()).length);
