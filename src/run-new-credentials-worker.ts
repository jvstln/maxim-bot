import { vote } from "./vote-using-new-credentials";
const MAX_VOTES = Infinity;
const CONCURRENCY = 1;
let completedCount = 0;
let iterationCount = 0;

async function runWorker(workerId: number) {
  while (completedCount < MAX_VOTES) {
    const currentIteration = ++iterationCount;
    try {
      console.log(
        `[Worker ${workerId}] === === Starting iteration ${currentIteration} === ===`,
      );

      await vote();

      console.log(
        `[Worker ${workerId}] === === Ending iteration ${currentIteration} === ===`,
      );
      completedCount++;
    } catch (error) {
      console.log(
        `[Worker ${workerId}] Iteration ${currentIteration} Failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

async function start() {
  console.log(`Starting ${CONCURRENCY} concurrent workers...`);
  const workers = [];
  for (let i = 1; i <= CONCURRENCY; i++) {
    workers.push(runWorker(i));
  }
  await Promise.all(workers);
}

start();
