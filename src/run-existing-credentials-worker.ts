import {getUnusedCredentials} from "./lib/db.js";
import {voteUsingExistingCredentials} from "./vote-using-existing-credentials.js";
import {browserConfig, puppeteer} from "./lib/puppeteer.js";
import type {Browser} from "puppeteer";

export const config = {
    workers: [] as Promise<void>[],
    concurrency: 5,
    isRunning: false,
};

const CONCURRENCY = config.concurrency;

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

    while (config.isRunning) {
        const currentIteration = ++iterationCount;
        try {
            // Get credentials that have not voted for more than a day
            const unusedCredential = await getNextUnusedCredential();

            if (!unusedCredential) {
                console.log(
                    `[Existing Worker ${workerId}]: >> No unused credentials left. Exiting.`,
                );
                break;
            }

            console.log(
                `[Existing Worker ${workerId}]: >> === === Starting iteration ${currentIteration} for ${unusedCredential.address} === ===`,
            );

            await voteUsingExistingCredentials(browser, unusedCredential, workerId);

            console.log(
                `[Existing Worker ${workerId}]: >> === === Ending iteration ${currentIteration} for ${unusedCredential.address} === ===`,
            );
        } catch (error) {
            console.log(
                `[Existing Worker ${workerId}]: >> ❌❌❌ Error: Iteration ${currentIteration} Failed:`,
                error instanceof Error ? error.message : String(error),
            );
        }
    }
}

export async function startExistingCredentialsWorkers() {
    if (config.isRunning) {
        console.log("[Main]: >> Existing credential workers are already running.");
        return;
    }

    config.isRunning = true;
    console.log(
        `[Main]: >> Starting ${config.concurrency} concurrent workers for existing credentials...`,
    );
    const browser = await puppeteer.launch(browserConfig);

    try {
        const workers = [];
        for (let i = 1; i <= CONCURRENCY; i++) {
            workers.push(runWorkerForExistingCredentials(i, browser));
        }
        config.workers = workers;
        await Promise.all(workers);
        console.log(
            "[Main]: >> --- --- ALL EXISTING CREDENTIALS HAVE VOTED --- ---",
        );
        await browser.close();
        console.log(
            "[Main]: >> All existing credential workers stopped and browser closed.",
        );
    } catch (error) {
        console.error(
            "[Main]: >> Error starting existing credentials workers:",
            error,
        );
    } finally {
        config.isRunning = false;
    }
}

export function stopExistingCredentialsWorkers() {
    console.log("Stopping existing credential workers...");
    config.isRunning = false;
    config.workers = []
}
