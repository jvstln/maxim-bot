import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export const browserConfig: Parameters<typeof puppeteer.launch>[0] = {
  // headless: false,
  // defaultViewport: null,
  headless: "shell",
  defaultViewport: { width: 1024, height: 1080 },
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
};

export { puppeteer };
