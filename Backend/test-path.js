require("dotenv").config();
/**
 * How to test?
 *  step 1: run "node server.js" to start the server
 *  step 2: run "node import-data.js boelter-hall.json" to import data(Only once)
 *  step 3: run "node test-path.js" to test path finding
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE_URL = "http://localhost:5050/api/path";
const MODE = "graph"; // or "bfs"

// === Test Case ===
const TEST_CASES = [
  { from: "Room 3420",        to: "8-Printer" },          // 1 Specify destination
  { from: "Boelter Entrance", type: "printer" },          // 2 Nearest printer
  { from: "Boelter Entrance", to:  "Room 3420" },         // 3 Specify classroom
  { from: "Boelter Entrance", type: "female-restroom" }   // 4 Nearesr female restroom
];


async function testPath(from, to) {
  const url = `${BASE_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&mode=${MODE}`;
  console.log(`\n Testing path from "${from}" to "${to}"`);

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      console.error(" API Error:", data.error);
      return;
    }
    console.log(` Path found using: ${data.algorithm}`);
    data.steps.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (depth: ${s.depth})`);
    });
  } catch (err) {
    console.error(" Failed:", err.message);
  }
}

async function runAllTests() {
  for (const test of TEST_CASES) {
    if (test.to) {
      await testPath(test.from, test.to);
    } else if (test.type) {
      await testPath(test.from, test.type);
    }
  }
}

runAllTests();
