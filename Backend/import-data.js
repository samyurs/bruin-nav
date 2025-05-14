/**
 * import-data.js
 * --------------
 * Bulk‑loads IndoorNodes + Landmarks from a JSON file in /data/.
 *
 * Usage example:
 *   node import-data.js boelter-3f.json
 */

require("dotenv").config();
const fs       = require("fs");
const path     = require("path");
const mongoose = require("mongoose");

const IndoorNode = require("./models/IndoorNode");
const Landmark   = require("./models/Landmark");

/* ---------- helper: return a 24‑hour‑open array (7 days) ---------- */
function defaultHours7d () {
  return Array.from({ length: 7 }).map(() => ({
    isOpen: true, open: 0, close: 1439
  }));
}

async function main(jsonFile) {
  /* 1. connect */
  await mongoose.connect(process.env.MONGO_URI);
  console.log(" Mongo connected");

  /* 2. read JSON file */
  const filePath = path.join(__dirname, "data", jsonFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${jsonFile} not found in /data`);
    process.exit(1);
  }
  const { nodes = [], landmarks = [] } = JSON.parse(fs.readFileSync(filePath));

  if (!nodes.length) {
    console.error("No nodes in JSON; nothing to import");
    process.exit(1);
  }

  /* 3. clear previous data (dev only) */
  await Promise.all([IndoorNode.deleteMany(), Landmark.deleteMany()]);
  console.log(" Collections cleared");

  /* 4. insert nodes first (no edges) */
  const nodeDocs = {};            // map name → saved document
  for (const n of nodes) {
    const doc = await IndoorNode.create({
      name: n.name,
      building: n.building || "Demo-Building",
      floor: n.floor ?? 0,
      type: n.type || "hall",
      connectsTo: []
    });
    nodeDocs[n.name] = doc;
  }

  /* 5. add connectsTo edges */
  for (const n of nodes) {
    const from = nodeDocs[n.name];
    from.connectsTo = (n.connectsTo || []).map(name => nodeDocs[name]._id);
    await from.save();
  }

  /* 6. insert landmarks (now edges exist) */
  for (const l of landmarks) {
    const nodeRef = nodeDocs[l.connectedTo];
    if (!nodeRef) {
      console.warn(`⚠  Skipping landmark "${l.name}" (unknown node ${l.connectedTo})`);
      continue;
    }

    await Landmark.create({
      name: l.name,
      type: l.type,
      connectedTo: [nodeRef._id],
      location: l.location,
      // give 7‑day default if hours missing / invalid
      hours: Array.isArray(l.hours) && l.hours.length === 7
        ? l.hours
        : defaultHours7d()
    });
  }

  console.log(" Import finished");
  await mongoose.disconnect();
  process.exit(0);
}

/* -------- CLI entry -------- */
const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node import-data.js <json-file-in-data>");
  process.exit(1);
}
main(fileArg).catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
