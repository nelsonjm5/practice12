const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// This lets Express serve your HTML, CSS, and JS files
app.use(express.static(path.join(__dirname)));

// Updated API route
const greeting = process.env.GREETING || "Hello from your deployed app!";

app.get("/api/message", (req, res) => {
  res.json({ message: greeting });
});

// POST route from Practice 10
app.post("/api/notes", (req, res) => {
  const { name, note } = req.body;

  if (!name || !note) {
    return res.status(400).json({ error: "Both name and note are required." });
  }

  res.status(201).json({
    message: "Note received!",
    data: { name, note }
  });
});

// This matters for AWS
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
