import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { PuppeteerNode } from "puppeteer";

// puppeteer-extra@3 types are stale (missing .use, createBrowserFetcher removed in newer puppeteer).
// Cast via any to bridge the gap.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(puppeteerExtra as any).use(StealthPlugin());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const puppeteer = puppeteerExtra as unknown as PuppeteerNode;

(puppeteer as any).use(StealthPlugin());

export const browserConfig: Parameters<typeof puppeteer.launch>[0] = {
  // headless: false,
  // defaultViewport: null,
  headless: "shell",
  defaultViewport: { width: 1024, height: 1080 },
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  ...(process.env.PUPPETEER_EXECUTABLE_PATH
    ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
    : {}),
};

export { puppeteer };
