import { getUnusedCredentials } from "./lib/db";
import { voteUsingExisitingCredentials } from "./vote-using-exisiting-credentials";

const CONCURRENCY = 1;

async function runExistingWorker(workerId: number) {
  let iterationCount = 0;

  while (true) {
    const currentIteration = ++iterationCount;
    try {
      // Get credentials that have not voted for more than a day
      const unusedCredential = (await getUnusedCredentials())[0];

      if (!unusedCredential) {
        console.log(
          `[Worker ${workerId}] No unused credentials left. Exiting.`,
        );
        break;
      }

      console.log(
        `[Worker ${workerId}] === === Starting iteration ${currentIteration} for ${unusedCredential.address} === ===`,
      );

      await voteUsingExisitingCredentials(unusedCredential);

      console.log(
        `[Worker ${workerId}] === === Ending iteration ${currentIteration} for ${unusedCredential.address} === ===`,
      );
    } catch (error) {
      console.log(
        `[Worker ${workerId}] Iteration ${currentIteration} Failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function start() {
  console.log(
    `Starting ${CONCURRENCY} concurrent workers for existing credentials...`,
  );
  const workers = [];
  for (let i = 1; i <= CONCURRENCY; i++) {
    workers.push(runExistingWorker(i));
  }
  await Promise.all(workers);
  console.log("--- --- ALL EXISTING CREDENTIALS HAVE VOTED --- ---");
}

start();
