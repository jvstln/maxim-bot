import { saveCredential } from "./lib/db";
import { createTempEmail, extractOtp } from "./lib/email.util";
import { browserConfig, puppeteer } from "./lib/puppeteer";
import type { Browser } from "puppeteer";

export async function vote(browser: Browser, workerId: number) {
  const context = await browser.createBrowserContext();
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    console.log(`[New Worker ${workerId}]: >> Navigating to voting page...`);
    await page.goto("https://covergirl.maxim.com/p/X29HF9S", {
      waitUntil: "networkidle2",
    });

    await page.screenshot({ path: "debug.png" });

    console.log(`[New Worker ${workerId}]: >> Clicking Vote button...`);
    await page.locator("button ::-p-text(Vote)").click();

    console.log(`[New Worker ${workerId}]: >> Creating temp email...`);
    const {
      address,
      password = "Password123!",
      token,
    } = await createTempEmail();
    if (!token) throw new Error("Error creating email: No token found");
    console.log(`[New Worker ${workerId}]: >> Email created: ${address}`);

    console.log(`[New Worker ${workerId}]: >> Filling in email & password...`);
    await page.locator("input[type=email]").fill(address);
    await page.locator("input[type=password]").fill(password);
    await page.keyboard.press("Enter");

    console.log(`[New Worker ${workerId}]: >> Waiting for OTP...`);
    const otp = await extractOtp({ token });
    if (!otp) throw new Error(`No OTP found in email: ${address}`);
    console.log(`[New Worker ${workerId}]: >> OTP received: ${otp}`);

    console.log(`[New Worker ${workerId}]: >> Submitting OTP...`);
    await page.locator("input[name=otp]").fill(otp);
    await page.keyboard.press("Enter");

    console.log(`[New Worker ${workerId}]: >> Waiting for confirmation...`);
    await page.locator("::-p-text(Congratulations)").wait();
    console.log(`[New Worker ${workerId}]: >> Vote successful!`);

    // If successful, save credentials
    await saveCredential({ address, password, token });
    console.log(`[New Worker ${workerId}]: >> ✅✅✅ Credentials saved to DB`);

    return { address, password, token };
  } finally {
    await context.close();
  }
}
