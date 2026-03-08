import axios from "axios";

const API_BASE_URL = "https://api.mail.tm";

export interface TempEmailAccount {
  id: string;
  address: string;
  password?: string;
  token?: string;
}

function generateRealisticUsername(): string {
  const firstNames = [
    "john",
    "michael",
    "sarah",
    "david",
    "emily",
    "james",
    "robert",
    "mary",
    "william",
    "jessica",
    "olivia",
    "emma",
    "noah",
    "liam",
    "sophia",
    "alexander",
    "mia",
    "ethan",
    "isabella",
    "mason",
    "charlotte",
    "logan",
    "amelia",
    "lucas",
    "harper",
    "jackson",
    "evelyn",
    "aiden",
    "abigail",
    "elijah",
    "benjamin",
    "grace",
    "ryan",
    "chloe",
    "nathan",
    "victoria",
    "caleb",
    "aria",
    "christian",
    "lily",
    "hunter",
    "aubrey",
    "isaac",
    "zoey",
    "luke",
    "penelope",
  ];

  const lastNames = [
    "smith",
    "johnson",
    "williams",
    "brown",
    "jones",
    "garcia",
    "miller",
    "davis",
    "rodriguez",
    "martinez",
    "doe",
    "hernandez",
    "lopez",
    "gonzalez",
    "wilson",
    "anderson",
    "thomas",
    "taylor",
    "moore",
    "jackson",
    "martin",
    "lee",
    "perez",
    "thompson",
    "white",
    "harris",
    "sanchez",
    "clark",
    "ramirez",
    "lewis",
    "robinson",
    "walker",
    "young",
    "allen",
    "king",
    "wright",
    "scott",
    "torres",
    "nguyen",
    "hill",
    "flores",
    "green",
    "adams",
    "nelson",
    "baker",
    "hall",
    "rivera",
    "campbell",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;

  // 50% chance to put the last name first
  if (Math.random() > 0.5) {
    return `${lastName}${firstName}${number}`;
  }

  return `${firstName}${lastName}${number}`;
}

export async function createTempEmail(): Promise<TempEmailAccount> {
  try {
    const domainsResponse = await axios.get(`${API_BASE_URL}/domains`);
    const domains = domainsResponse.data["hydra:member"];

    if (!domains || domains.length === 0) {
      throw new Error("No domains available from Mail.tm");
    }

    const domain = domains[0].domain;

    const username = generateRealisticUsername();
    const address = `${username}@${domain}`;
    const password =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const createAccountResponse = await axios.post(`${API_BASE_URL}/accounts`, {
      address,
      password,
    });

    const account = createAccountResponse.data;

    const tokenResponse = await axios.post(`${API_BASE_URL}/token`, {
      address,
      password,
    });

    return {
      id: account.id,
      address,
      password,
      token: tokenResponse.data.token,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Mail.tm API Error (Create):",
        error.response?.data || error.message,
      );
    } else {
      console.error("Error creating temp email:", error);
    }
    throw error;
  }
}

export async function extractOtp({
  token,
  otpRegex = /\b\d{4,8}\b/,
  maxAttempts = 10,
  delayMs = 2000,
}: {
  token: string;
  otpRegex?: RegExp;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages = response.data["hydra:member"];

      if (messages && messages.length > 0) {
        for (const msg of messages) {
          const msgResponse = await axios.get(
            `${API_BASE_URL}/messages/${msg.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          const content = msgResponse.data.text || msgResponse.data.intro || "";

          const otpMatch = content.match(otpRegex);
          if (otpMatch) {
            return otpMatch[0];
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Mail.tm API Error (Fetch Messages):",
          error.response?.data || error.message,
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return null;
}
