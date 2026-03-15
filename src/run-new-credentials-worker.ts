import type { Browser } from "puppeteer";
import { browserConfig, puppeteer } from "./lib/puppeteer.js";
import { vote } from "./vote-using-new-credentials.js";

export const config = {
  workers: [] as Promise<void>[],
  concurrency: 1,
  iterationCount: 0,
  isRunning: false,
};

async function runWorkerForNewCredentials(workerId: number, browser: Browser) {
  while (config.isRunning) {
    ++config.iterationCount;
    try {
      console.log(
        `[New Worker ${workerId}]: >> === === Starting iteration ${config.iterationCount} === ===`,
      );
      await vote(browser, workerId);

      console.log(
        `[New Worker ${workerId}]: >> === === Ending iteration ${config.iterationCount} === ===`,
      );
    } catch (error) {
      console.log(
        `[New Worker ${workerId}]: >> ❌❌❌ Error: Iteration ${config.iterationCount} Failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  console.log(`[New Worker ${workerId}]: >> Cleanly exited.`);
}

export async function startNewCredentialWorkers() {
  if (config.isRunning) {
    console.log("[Main]: >> New credential workers are already running.");
    return;
  }

  config.isRunning = true;
  console.log(
    `[Main]: >> Starting ${config.concurrency} concurrent workers...`,
  );
  const browser = await puppeteer.launch(browserConfig);

  config.workers = []; // Reset workers array
  for (let i = 1; i <= config.concurrency; i++) {
    config.workers.push(runWorkerForNewCredentials(i, browser));
  }
  await Promise.all(config.workers);

  await browser.close();
  console.log(
    "[Main]: >> All new credential workers stopped and browser closed.",
  );
}

export function stopNewCredentialWorkers() {
  console.log("Stopping new credential workers...");
  config.isRunning = false;
  config.workers = [];
}
