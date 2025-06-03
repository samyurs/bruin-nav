/**
 * PATH ROUTER
 * -----------
 * Calculates indoor routes between two landmarks.
 *
 * 1.  If `to` is a *type*   (e.g. printer) → run a BFS that
 *     expands outward until the first landmark of that type is found.
 * 2.  If `to` is a *name*   (e.g. "Room 3420") →
 *     2‑1  run our own JavaScript BFS to guarantee the shortest path
 *     2‑2  *optionally* run Mongo $graphLookup when the client asks
 *          for `mode=graph`; we only keep that result if it is strictly
 *          shorter than the BFS baseline.
 *
 *  →  This keeps correctness (BFS) while leaving a switch for future
 *     large‑scale optimisations with $graphLookup.
 */

import express from "express";
import mongoose from "mongoose";

import Landmark from "../models/Landmark.js";
import IndoorNode from "../models/IndoorNode.js";
import { generateNaturalLanguageInstructions } from "../lib/ai.js";

const router = express.Router();

// Allowed categories that a client can pass as `to=printer` etc.
const knownTypes = [
  "printer",
  "classroom",
  "male-restroom",
  "female-restroom",
  "neutral-restroom"
];

// Keep the time consistent (use Los Angeles time)
const laTZ = "America/Los_Angeles";
function nowLA () {
  return new Date().toLocaleString("en-US", { timeZone: laTZ });
}

function isOpenNow(hoursArr, now = new Date()) {
  if (!Array.isArray(hoursArr) || hoursArr.length !== 7) return true;

  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const h = hoursArr[day];

  if (!h?.isOpen) return false;
  if (mins < h.open || mins > h.close) return false;
  return true;
}

// Determine whether the current node is reachable by the target user.
function isNodeAccessible(nodeDoc, needAccessible) {
  return !needAccessible || nodeDoc.accessible !== false;
}

/**
 * Compress consecutive stair nodes in the path.
 * If two consecutive nodes are both stairs and on different floors,
 * they represent the two ends of the same staircase.
 * To simplify the path, we keep only the first stair node.
 */
function compressStairs(pathIds, id2name) {
  const out = [];

  for (const id of pathIds) {
    const currName = id2name[id];
    const prevId   = out[out.length - 1];
    const prevName = id2name[prevId];

    // If both current and previous nodes are stairs, and on different floors,
    // treat them as one stair segment and skip the second.
    if (prevName && isStair(prevName) && isStair(currName) &&
        getFloor(prevName) !== getFloor(currName)) {
      continue;
    }

    out.push(id);
  }

  return out;
}
  // Determine whether a landmark is currently open and accessible. （Still exist bugs)
function isLandmarkAvailable(lm) {
  const okTime = isOpenNow(lm.hours, new Date(nowLA()));
  const okAcc = lm.accessible === undefined || lm.accessible === true;
  // console.log(`🧪 [${lm.name}] openNow=${okTime} accessible=${lm.accessible} ⇒ ok=${okTime && okAcc}`);
  return okTime && okAcc;
}


// Helper: extract floor number from node name like "4-Stair-UpTo5"
const stairRe  = /^(\d+)-Stair/;
const isStair  = (name) => name?.includes("Stair");
const getFloor = (name) => Number(name.match(stairRe)?.[1] || NaN);


// ------------------------------------------------------------------
// GET /api/path?from=...&to=...[&mode=bfs|graph]
// ------------------------------------------------------------------
router.get("/", async (req, res) => {
  // default to BFS so we always return a shortest path
  const { from, to, mode = "bfs" } = req.query;
  const needAccessible = true; // default to accessible
  if (!from || !to) {
    return res.status(400).json({ error: "`from` and `to` are required" });
  }

  // 1.  Source landmark  -----------------------------------------------------
  const srcL = await Landmark.findOne({ name: from });
  if (!srcL) return res.status(404).json({ error: "Source landmark not found" });

  const [srcNodeId] = srcL.connectedTo || [];
  if (!srcNodeId) {
    return res
      .status(400)
      .json({ error: "Source landmark is not linked to an IndoorNode" });
  }

  // 2.  Decide how to interpret `to` ----------------------------------------
  let dstL, pathIds;
  let algo = "bfs"; // keep track of which algorithm we finally used

  // 2‑A. `to` is a *category*  (printer / restroom / …) ---------------------
  if (knownTypes.includes(to)) {
    const nearest = await findNearestLandmarkByType(srcNodeId.toString(), to, needAccessible);
    if (!nearest) {
      return res
        .status(404)
        .json({ error: `No reachable landmark of type '${to}'` });
    }

    dstL   = nearest.landmark;
    pathIds = nearest.path; // already a BFS shortest path
    algo    = "bfs (via type)";
  }

  // 2‑B. `to` is an explicit *landmark name* --------------------------------
  else {
    dstL = await Landmark.findOne({ name: to });
    if (!(await isLandmarkAvailable(dstL, needAccessible))) {
      return res.status(404).json({ error: "Destination landmark is not available" });
    }

    const [dstNodeId] = dstL.connectedTo || [];
    if (!dstNodeId) {
      return res
        .status(400)
        .json({ error: "Destination landmark is not linked to an IndoorNode" });
    }

    // 2‑B‑1  Baseline — always run BFS first (guaranteed shortest)
    const bfsPath = await bfsSearch(
      srcNodeId.toString(),
      dstNodeId.toString(),
      needAccessible
    );
    if (!bfsPath) return res.status(404).json({ error: "No route found" });

    pathIds = bfsPath; // default choice

    // 2‑B‑2  Optional optimisation — run $graphLookup when asked
    if (mode === "graph") {
      const graphPath = await runGraph(srcNodeId, dstNodeId);
      // we only keep it when it *beats* BFS
      if (graphPath && graphPath.length < bfsPath.length) {
        pathIds = graphPath;
        algo    = "graph";
      }
    }
  }

  // 3.  Translate node IDs → human‑readable names ---------------------------
  const nodes = await IndoorNode.find({ _id: { $in: pathIds } })
    .select("name")
    .lean();
  const id2name = Object.fromEntries(nodes.map((n) => [n._id.toString(), n.name]));
  // Compress stair nodes
  pathIds = compressStairs(pathIds, id2name);
  
  const steps = pathIds.map(id => id2name[id]);

  // 4. Generate natural language instructions using Gemini AI
  const naturalLanguageInstructions = await generateNaturalLanguageInstructions(
    steps, srcL.name, dstL.name
  );

  return res.json({
    algorithm: algo,
    from:      srcL.name,
    to:        dstL.name,
    instructions: naturalLanguageInstructions
  });
});

// ------------------------------------------------------------------
// Helper: BFS outward until the first landmark of type xyz is found
// ------------------------------------------------------------------
async function findNearestLandmarkByType(startNodeId, type, needAccessible) {
  const queue   = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length) {
    const path   = queue.shift();
    const nodeId = path.at(-1);

    // Is there a landmark of this type attached to *this* node?
    const lm = await Landmark.findOne({ connectedTo: nodeId, type }).lean();
    if (lm && await isLandmarkAvailable(lm)) {
      return { landmark: lm, path };
    }
    // Expand neighbours
    const node = await IndoorNode.findById(nodeId).select("connectsTo accessible");
    for (const nextId of node.connectsTo) {
      const str = nextId.toString();
      if (!visited.has(str)) {
        const nextDoc = await IndoorNode.findById(nextId).select("accessible");
        if (!isNodeAccessible(nextDoc, needAccessible)) continue; // Skip unreachable nodes
        visited.add(str);
        queue.push([...path, str]);
      }
    }
  }
  return null;
}

// ------------------------------------------------------------------
// Helper: MongoDB $graphLookup — fetch whole sub‑graph in one query
// ------------------------------------------------------------------
async function runGraph(srcNodeId, dstNodeId) {
  const agg = await IndoorNode.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(srcNodeId) } },
    {
      $graphLookup: {
        from:             "indoornodes",
        startWith:        "$_id",
        connectFromField: "connectsTo",
        connectToField:   "_id",
        as:               "path",
        depthField:       "depth",
        maxDepth:         15
      }
    }
  ]);

  const full   = agg?.[0]?.path || [];
  const target = full.find((n) => n._id.toString() === dstNodeId.toString());
  if (!target) return null;

  // Reconstruct one candidate path by trimming to maxDepth
  return full
    .filter((n) => n.depth <= target.depth)
    .sort((a, b) => a.depth - b.depth)
    .map((n) => n._id.toString());
}

// ------------------------------------------------------------------
// Helper: plain JavaScript BFS — guarantees shortest path
// ------------------------------------------------------------------
async function bfsSearch(startId, endId, needAccessible) {
  const queue   = [[startId]];
  const visited = new Set([startId]);

  while (queue.length) {
    const path   = queue.shift();
    const nodeId = path.at(-1);
    if (nodeId === endId) return path;

    const node = await IndoorNode.findById(nodeId).select("connectsTo accessible");
    for (const nextId of node.connectsTo) {
      const str = nextId.toString();
      if (!visited.has(str)) {
        const nextDoc = await IndoorNode.findById(nextId).select("accessible");
        if (!isNodeAccessible(nextDoc, needAccessible)) continue;
        visited.add(str);
        queue.push([...path, str]);
      }
    }
  }
  return null; // unreachable
}

export default router;
