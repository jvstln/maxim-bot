import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export const browserConfig: Parameters<typeof puppeteer.launch>[0] = {
  headless: false,
  defaultViewport: { width: 1024, height: 1080 },
  // args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

export { puppeteer };
