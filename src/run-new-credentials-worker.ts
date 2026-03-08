import { browserConfig, puppeteer } from "./lib/puppeteer";
import { vote } from "./vote-using-new-credentials";
import type { Browser } from "puppeteer";
const MAX_VOTES = Infinity;
const CONCURRENCY = 4;
let successfulIterationCount = 0;
let iterationCount = 0;

async function runWorkerForNewCredentials(workerId: number, browser: Browser) {
  while (successfulIterationCount < MAX_VOTES) {
    const currentIteration = ++iterationCount;
    try {
      console.log(
        `[Worker ${workerId}] === === Starting iteration ${currentIteration} === ===`,
      );

      await vote(browser);

      console.log(
        `[Worker ${workerId}] === === Ending iteration ${currentIteration} === ===`,
      );
      successfulIterationCount++;
    } catch (error) {
      console.log(
        `❌❌❌ Error: [Worker ${workerId}] Iteration ${currentIteration} Failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function start() {
  console.log(`Starting ${CONCURRENCY} concurrent workers...`);
  const browser = await puppeteer.launch(browserConfig);

  const workers = [];
  for (let i = 1; i <= CONCURRENCY; i++) {
    workers.push(runWorkerForNewCredentials(i, browser));
  }
  await Promise.all(workers);
}

start();
