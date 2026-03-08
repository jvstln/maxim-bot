import { saveCredential } from "./lib/db";
import { createTempEmail, extractOtp } from "./lib/emailUtils";
import { browserConfig, puppeteer } from "./lib/puppeteer";

export async function vote() {
  const browser = await puppeteer.launch(browserConfig);

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

    // If successful, save credentials
    await saveCredential({ address, password, token });
    console.log("Credentials saved to DB");

    return { address, password, token };
  } finally {
    await browser.close();
  }
}
