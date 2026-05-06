const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:21017/portfolio")
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  messageAr: { type: String, required: true },
  messageEn: { type: String, required: true },
  Kinship: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

app.post("/api/comments", async (req, res) => {
  try {
    const { name, email, messageAr, messageEn, Kinship } = req.body;

    const newComment = new Comment({
      name,
      email,
      messageAr,
      messageEn,
      Kinship,
    });

    await newComment.save();

    res
      .status(201)
      .json({ success: true, message: "Comment sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ isActive: true });

    if (!comments) {
      return res
        .status(404)
        .json({ success: false, error: "Comments not found" });
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/comments/is-not-active", async (req, res) => {
  try {
    const comments = await Comment.find({ isActive: false });

    if (!comments) {
      return res
        .status(404)
        .json({ success: false, error: "Comments not found" });
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/comments/is-active/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.params; 

    if (password !== process.env.PASSWORD) {
      return res.status(401).json({ success: false, message: "Unauthorized" }); 
    }

    const result = await Comment.updateOne(
      { _id: id },
      { $set: { isActive: true } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Comment activated successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
