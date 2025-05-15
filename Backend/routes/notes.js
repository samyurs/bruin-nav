import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

// Get all notes
router.get("/", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// Add a new note
router.post("/", async (req, res) => {
  const note = new Note(req.body);
  const saved = await note.save();
  res.json(saved);
});

export default router;