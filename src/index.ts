import express from "express";
import {
    startNewCredentialWorkers,
    stopNewCredentialWorkers,
} from "./run-new-credentials-worker";
import {
    startExistingCredentialsWorkers,
    stopExistingCredentialsWorkers,
} from "./run-existing-credentials-worker";

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

app.listen(PORT, () => {
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
