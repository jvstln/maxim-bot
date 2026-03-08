import type { Credential } from "./lib/credentials-helper";
import { saveCredential } from "./lib/db";
import { browserConfig, puppeteer } from "./lib/puppeteer";

export async function voteUsingExisitingCredentials(credential: Credential) {
  const { address, password } = credential;
  const browser = await puppeteer.launch(browserConfig);

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60_000);

    console.log(">> Navigating to voting page...");
    await page.goto("https://covergirl.maxim.com/p/X29HF9S", {
      waitUntil: "networkidle2",
    });

    console.log(">> Clicking Vote button...");
    await page.locator("button ::-p-text(Vote)").click();

    console.log(">> Logging in...");
    await page.locator("button ::-p-text(Login)").click();

    await page.locator("input[type=email]").fill(address);
    await page.locator("input[type=password]").fill(password);
    await page.keyboard.press("Enter");

    console.log(">> Waiting for confirmation...");
    await page
      .locator("::-p-text(Congratulations), ::-p-text(already cast)")
      .wait();
    console.log(">> Vote successful!");

    // Update the last_used property
    await saveCredential(credential);
    console.log(`Credential for ${address} updated`);

    return { address, password };
  } finally {
    await browser.close();
  }
}
