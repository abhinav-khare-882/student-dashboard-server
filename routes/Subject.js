const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject"); // ✅ Import Subject Model

// ✅ Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find(); // Fetch subjects from MongoDB
    res.json(subjects);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch subjects", details: error.message });
  }
});

// ✅ Add a new subject (Optional: Use this to add subjects manually)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ error: "Subject name is required" });

    const newSubject = new Subject({ name });
    await newSubject.save();

    res.status(201).json(newSubject);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add subject", details: error.message });
  }
});

module.exports = router;
