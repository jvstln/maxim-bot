import { createTempEmail, extractOtp } from "./emailUtils";

async function run() {
  console.log("Testing createTempEmail...");
  const account = await createTempEmail();
  console.log("Account created:", account.address);
  console.log("Password:", account.password);
  console.log("Token:", account.token?.substring(0, 20) + "...");

  console.log(
    '\nNow waiting for OTP... (Send an email with a code like "Here is your code: 123456" to this address to test)',
  );
  console.log(
    "Extracting OTP (will timeout in ~10 seconds for this test if no mail arrives)...",
  );

  // We'll limit attempts to 5 for quick testing
  const otp = await extractOtp({ token: account.token! });

  if (otp) {
    console.log("Found OTP:", otp);
  } else {
    console.log("No OTP found (as expected if no email was sent).");
  }
}

run().catch(console.error);
