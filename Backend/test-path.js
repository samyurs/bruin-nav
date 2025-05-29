require("dotenv").config();
/**
 * How to test?
 *  step 1: run "node server.js" to start the server
 *  step 2: run "node import-data.js boelter-hall.json" to import data(Only once)
 *  step 3: run "node test-path.js" to test path finding
 */
require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const BASE_URL = "http://localhost:5050/api/path";
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
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("  ❌ Unexpected non-JSON response");
      return;
    }

    if (!res.ok) {
      console.error(`  ❌ ${data.error}`);
      return;
    }

    console.log(`  Path found using: ${data.algorithm}`);
    data.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name} (depth: ${step.depth})`);
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
