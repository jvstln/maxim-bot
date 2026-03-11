import type { Browser } from "puppeteer";
import { saveCredential, type Credential } from "./lib/db.js";

export async function voteUsingExistingCredentials(
  browser: Browser,
  credential: Credential,
  workerId: number,
) {
  const { address, password } = credential;
  const context = await browser.createBrowserContext();

  try {
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);

    console.log(
      `[Existing Worker ${workerId}]: >> Navigating to voting page...`,
    );
    await page.goto("https://covergirl.maxim.com/p/X29HF9S", {
      waitUntil: "networkidle2",
    });

    console.log(`[Existing Worker ${workerId}]: >> Clicking Vote button...`);
    await page.locator("button ::-p-text(Vote)").click();

    console.log(`[Existing Worker ${workerId}]: >> Logging in...`);
    await page.locator("button ::-p-text(Login)").click();

    await page.locator("input[type=email]").fill(address);
    await page.locator("input[type=password]").fill(password);
    await page.keyboard.press("Enter");

    console.log(
      `[Existing Worker ${workerId}]: >> Waiting for confirmation...`,
    );
    await page
      .locator("::-p-text(Congratulations), ::-p-text(already cast)")
      .wait();
    console.log(`[Existing Worker ${workerId}]: >> Vote successful!`);

    // Update the last_used property
    await saveCredential(credential);
    console.log(
      `[Existing Worker ${workerId}]: >> ✅✅✅ Credential for ${address} updated`,
    );

    return { address, password };
  } finally {
    await context.close();
  }
}
