const mongoose = require("mongoose");
 // Used for "user comment system related to facilities"
const NoteSchema = new mongoose.Schema({
  building: String,
  text: String,
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Note", NoteSchema);