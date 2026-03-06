import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { createTempEmail, extractOtp } from "./emailUtils";
import fs from "node:fs/promises";

puppeteer.use(StealthPlugin());

async function vote() {
  const browser = await puppeteer.launch({
    headless: "shell",
    defaultViewport: { width: 1920, height: 1080 },
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60_000);
    console.log(">> Navigating to voting page...");
    await page.goto("https://covergirl.maxim.com/p/X29HF9S", {
      waitUntil: "networkidle2",
    });

    await page.screenshot({ path: "debug.png" });

    console.log(">> Clicking Vote button...");
    await page.locator("button ::-p-text(Vote)").click();

    console.log(">> Creating temp email...");
    const {
      address,
      password = "Password123!",
      token,
    } = await createTempEmail();
    if (!token) throw new Error("Error creating email: No token found");
    console.log(`>> Email created: ${address}`);

    console.log(">> Filling in email & password...");
    await page.locator("input[type=email]").fill(address);
    await page.locator("input[type=password]").fill(password);
    await page.keyboard.press("Enter");

    console.log(">> Waiting for OTP...");
    const otp = await extractOtp({ token });
    if (!otp) throw new Error(`No OTP found in email: ${address}`);
    console.log(`>> OTP received: ${otp}`);

    console.log(">> Submitting OTP...");
    await page.locator("input[name=otp]").fill(otp);
    await page.keyboard.press("Enter");

    console.log(">> Waiting for confirmation...");
    await page.locator("::-p-text(Congratulations)").wait();
    console.log(">> Vote successful!");

    return { address, password, token };
  } finally {
    await browser.close();
  }
}

const MAX_VOTES = Infinity;
const CONCURRENCY = 3;
let completedCount = 0;
let iterationCount = 0;

async function runWorker(workerId: number) {
  while (completedCount < MAX_VOTES) {
    const currentIteration = ++iterationCount;
    try {
      console.log(
        `[Worker ${workerId}] === === Starting iteration ${currentIteration} === ===`,
      );
      const { address, password, token } = await vote();
      console.log(
        `[Worker ${workerId}] === === Ending iteration ${currentIteration} === ===`,
      );

      // If successful, save credentials to file
      await fs.appendFile(
        "credentials.txt",
        `${address} -- ${password} -- ${token}\n`,
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
