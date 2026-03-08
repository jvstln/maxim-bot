import { getUnusedCredentials } from "./lib/db";
import { voteUsingExisitingCredentials } from "./vote-using-exisiting-credentials";
import { browserConfig, puppeteer } from "./lib/puppeteer";
import type { Browser } from "puppeteer";

const CONCURRENCY = 5;

let unusedCredentials: Awaited<ReturnType<typeof getUnusedCredentials>> = [];

// A mutex to prevent race conditions where multiple workers grab the same credential
let isFetching = false;

// A helper function to minimize the query calls made to the database
const getNextUnusedCredential = async () => {
  // Wait if another worker is currently grabbing a credential
  while (isFetching) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  isFetching = true;

  try {
    if (unusedCredentials.length !== 0) {
      return unusedCredentials.shift();
    }

    unusedCredentials = await getUnusedCredentials();
    if (unusedCredentials.length === 0) return null;

    return unusedCredentials.shift();
  } finally {
    isFetching = false;
  }
};

async function runWorkerForExistingCredentials(
  workerId: number,
  browser: Browser,
) {
  let iterationCount = 0;

  while (true) {
    const currentIteration = ++iterationCount;
    try {
      // Get credentials that have not voted for more than a day
      const unusedCredential = await getNextUnusedCredential();

      if (!unusedCredential) {
        console.log(
          `[Worker ${workerId}] No unused credentials left. Exiting.`,
        );
        break;
      }

      console.log(
        `[Worker ${workerId}] === === Starting iteration ${currentIteration} for ${unusedCredential.address} === ===`,
      );

      await voteUsingExisitingCredentials(browser, unusedCredential);

      console.log(
        `[Worker ${workerId}] === === Ending iteration ${currentIteration} for ${unusedCredential.address} === ===`,
      );
    } catch (error) {
      console.log(
        `❌❌❌ Error: [Worker ${workerId}] Iteration ${currentIteration} Failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function start() {
  console.log(
    `Starting ${CONCURRENCY} concurrent workers for existing credentials...`,
  );
  const browser = await puppeteer.launch(browserConfig);

  try {
    const workers = [];
    for (let i = 1; i <= CONCURRENCY; i++) {
      workers.push(runWorkerForExistingCredentials(i, browser));
    }
    await Promise.all(workers);
    console.log("--- --- ALL EXISTING CREDENTIALS HAVE VOTED --- ---");
  } finally {
    await browser.close();
  }
}

start();
