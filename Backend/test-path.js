import 'dotenv/config';
/**
 * How to test?
 *  step 1: run "node server.js" to start the server
 *  step 2: run "node import-data.js boelter-hall.json" to import data(Only once)
 *  step 3: run "node test-path.js" to test path finding
 */

const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const BASE_URL = `${API_BASE_URL}/path`;
const MODE     = "graph";    // or "bfs"

const TEST_CASES = [
  { from: "Room 3420",        to: "8-Printer" },
  { from: "Boelter Entrance", to: "printer"},
  { from: "Boelter Entrance", to: "Room 3420" },
  { from: "Boelter Entrance", to: "female-restroom"}
];

/**
 * Execute one test and print readable output.
 */
async function testPath({ from, to, accessible }) {
  const params = [
    `from=${encodeURIComponent(from)}`,
    `to=${encodeURIComponent(to)}`,
    `mode=${MODE}`,
    accessible ? "accessible=true" : ""
  ].filter(Boolean).join("&");

  const url = `${BASE_URL}?${params}`;
  console.log(`\nTesting path from "${from}" to "${to}"`);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error(`  ❌ ${data.error}`);
      return;
    }

    console.log(`  Path found using: ${data.algorithm}`);
    data.instructions.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

  } catch (err) {
    console.error("  ❌ Fetch failed:", err.message);
  }
}

/**
 * Run all test cases.
 */
(async function runAllTests() {
  for (const test of TEST_CASES) {
    await testPath(test);
  }
})();
