import express from "express";
import { db, getUnusedCredentials } from "./lib/db.js";
import { credentialsTable } from "./lib/schema.js";
import {
  config as existingCredentialsWorkers,
  startExistingCredentialsWorkers,
  stopExistingCredentialsWorkers,
} from "./run-existing-credentials-worker.js";
import {
  config as newCredentialsConfig,
  startNewCredentialWorkers,
  stopNewCredentialWorkers,
} from "./run-new-credentials-worker.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.get("/start", (_req, res) => {
  res.send("Bot start request received!");
  startNewCredentialWorkers();
  startExistingCredentialsWorkers();
});

app.get("/stop", (_req, res) => {
  stopNewCredentialWorkers();
  stopExistingCredentialsWorkers();

  res.send(
    "Workers are stopping. They will finish their current iteration and then close the browser.",
  );
});

app.get("/db-status", async (_req, res) => {
  const allCredentials = await db.select().from(credentialsTable);
  const unusedCredentials = await getUnusedCredentials();

  res.json({
    totalCredentials: allCredentials.length,
    unusedCredentials: unusedCredentials.length,
  });
});

app.get("/test", (_req, res) => {
  console.log(
    "Maxim bot up and running!",
    newCredentialsConfig,
    existingCredentialsWorkers,
  );
  res.send("Maxim bot up server and running!");
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  stopNewCredentialWorkers();
  stopExistingCredentialsWorkers();

  // Give it a few seconds to let browsers close gracefully
  setTimeout(() => {
    process.exit();
  }, 5000);
});
