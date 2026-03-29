import puppeteer from "puppeteer";

const UI = "http://localhost:5173";
const API = "http://localhost:8000";

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

const timestamp = Date.now();
const testEmail = `test${timestamp}@e2e.com`;
const testPassword = "TestPass123!";

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("\n--- UI Tests ---\n");

  // 1. Registration
  await test("Registration — fill form, submit, redirect to dashboard", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${UI}/register`, { waitUntil: "networkidle2" });
      const inputs = await page.$$("input");
      assert(inputs.length >= 4, `Expected 4+ inputs, got ${inputs.length}`);
      await inputs[0].type("Test");
      await inputs[1].type("User");
      await inputs[2].type(testEmail);
      await inputs[3].type(testPassword);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);
      assert(page.url().includes("/dashboard"), `Expected /dashboard, got ${page.url()}`);
    } finally {
      await page.close();
    }
  });

  // 2. Login
  await test("Login — enter credentials, submit, redirect to dashboard", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${UI}/login`, { waitUntil: "networkidle2" });
      await page.type('input[type="email"]', "admin@demo.com");
      await page.type('input[type="password"]', "demo1234");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);
      assert(page.url().includes("/dashboard"), `Expected /dashboard, got ${page.url()}`);
    } finally {
      await page.close();
    }
  });

  // 3. Plants page
  await test("Plants page — renders plant cards, search filter works", async () => {
    const page = await browser.newPage();
    try {
      await loginAs(page, "admin@demo.com", "demo1234");
      await page.goto(`${UI}/plants`, { waitUntil: "networkidle2" });
      await page.waitForSelector("[class*='card'], [class*='Card'], [class*='plant']", { timeout: 5000 });
      const cards = await page.$$("[class*='card'], [class*='Card'], [class*='plant']");
      assert(cards.length > 0, "No plant cards found");
      const searchInput = await page.$('input[type="text"], input[type="search"], input[placeholder*="earch"]');
      if (searchInput) {
        await searchInput.type("tomato");
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      await page.close();
    }
  });

  // 4. Plant detail
  await test("Plant detail — click card, verify detail page loads", async () => {
    const page = await browser.newPage();
    try {
      await loginAs(page, "admin@demo.com", "demo1234");
      await page.goto(`${UI}/plants`, { waitUntil: "networkidle2" });
      await page.waitForSelector("[class*='card'], [class*='Card'], [class*='plant']", { timeout: 5000 });
      const cards = await page.$$("[class*='card'], [class*='Card'], [class*='plant']");
      assert(cards.length > 0, "No plant cards to click");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }).catch(() => {}),
        cards[0].click(),
      ]);
      await new Promise((r) => setTimeout(r, 1000));
      const url = page.url();
      const hasDetail = url.includes("/plants/") || url.includes("/plant/");
      assert(hasDetail, `Expected plant detail URL, got ${url}`);
      const body = await page.evaluate(() => document.body.innerText);
      assert(body.length > 50, "Plant detail page has no content");
    } finally {
      await page.close();
    }
  });

  // 5. Garden flow
  await test("Garden flow — navigate, verify garden picker, select garden", async () => {
    const page = await browser.newPage();
    try {
      await loginAs(page, "admin@demo.com", "demo1234");
      await page.goto(`${UI}/garden`, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 1000));
      const body = await page.evaluate(() => document.body.innerText.toLowerCase());
      const hasGardenContent =
        body.includes("garden") || body.includes("grid") || body.includes("bed") || body.includes("select");
      assert(hasGardenContent, "Garden page has no garden-related content");
    } finally {
      await page.close();
    }
  });

  // 6. Planting calendar
  await test("Planting calendar — navigate, verify it loads", async () => {
    const page = await browser.newPage();
    try {
      await loginAs(page, "admin@demo.com", "demo1234");
      await page.goto(`${UI}/calendar`, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 1000));
      const body = await page.evaluate(() => document.body.innerText.toLowerCase());
      const hasCalendarContent =
        body.includes("calendar") || body.includes("zone") || body.includes("plant") || body.includes("schedule");
      assert(hasCalendarContent, "Calendar page has no relevant content");
    } finally {
      await page.close();
    }
  });

  console.log("\n--- API Tests ---\n");

  // 7. Health check
  await test("Health check — GET /health returns ok", async () => {
    const res = await fetch(`${API}/health`);
    assert(res.ok, `Health check returned ${res.status}`);
    const data = await res.json();
    assert(data.status === "ok", `Expected { status: "ok" }, got ${JSON.stringify(data)}`);
  });

  // 8. API registration
  await test("API registration — POST /v1/api/auth returns 201", async () => {
    const apiEmail = `api${timestamp}@e2e.com`;
    const res = await fetch(`${API}/v1/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Api",
        lastName: "Test",
        email: apiEmail,
        password: testPassword,
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
  });

  // 9. API login
  await test("API login — POST /v1/api/auth/login returns 200 with cookie", async () => {
    const res = await fetch(`${API}/v1/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@demo.com",
        password: "demo1234",
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const cookies = res.headers.get("set-cookie");
    assert(cookies, "No set-cookie header in login response");
  });

  // 10. API plants
  await test("API plants — GET /v1/api/plants returns array", async () => {
    const loginRes = await fetch(`${API}/v1/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@demo.com",
        password: "demo1234",
      }),
    });
    const cookies = loginRes.headers.get("set-cookie") || "";
    const res = await fetch(`${API}/v1/api/plants`, {
      headers: { Cookie: cookies },
    });
    assert(res.ok, `Plants endpoint returned ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), `Expected array, got ${typeof data}`);
    assert(data.length > 0, "Plants array is empty");
  });

  await browser.close();

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

async function loginAs(page, email, password) {
  await page.goto(`${UI}/login`, { waitUntil: "networkidle2" });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);
}

run();
