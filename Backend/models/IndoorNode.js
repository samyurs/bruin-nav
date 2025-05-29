const mongoose = require("mongoose");

/**
 * IndoorNode represents a walkable point within a building,
 * such as a hallway, elevator, stair, or door.
 * Nodes are connected to each other via `connectsTo` to form a graph.
 */
const IndoorNodeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "boelter-hall-3f-stair-a"
  building: { type: String },             // Optional: e.g. "Boelter Hall"
  floor: { type: Number },                // Optional: e.g. 3

  type: {
    type: String,
    enum: ['hall', 'stair', 'elevator', 'door',],
    default: 'hall'
  },
  accessible: { type: Boolean, default: true },
  // List of other IndoorNode _id's this node connects to (graph edge)
  connectsTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IndoorNode' }]
});

module.exports = mongoose.model("IndoorNode", IndoorNodeSchema);
