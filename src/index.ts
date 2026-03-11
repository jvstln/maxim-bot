import express from "express";
import {
  startNewCredentialWorkers,
  stopNewCredentialWorkers,
  config as newCredentialsConfig,
} from "./run-new-credentials-worker.js";
import {
  startExistingCredentialsWorkers,
  stopExistingCredentialsWorkers,
  config as existingCredentialsWorkers,
} from "./run-existing-credentials-worker.js";

const app = express();

let PORT = process.env.PORT ?? 3000;

app.get("/start", (req, res) => {
  res.send("Bot start request received!");
  startNewCredentialWorkers();
  startExistingCredentialsWorkers();
});

app.get("/stop", (req, res) => {
  stopNewCredentialWorkers();
  stopExistingCredentialsWorkers();

  res.send(
    "Workers are stopping. They will finish their current iteration and then close the browser.",
  );
});

app.get("/test", (req, res) => {
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
