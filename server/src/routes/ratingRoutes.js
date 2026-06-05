import express from "express";
import { Rating } from "../models/Rating.js";
import { protect } from "../middleware/auth.js";

export const ratingRouter = express.Router();

ratingRouter.get("/summary", async (_req, res, next) => {
  try {
    const ratings = await Rating.find().select("stars");
    const count = ratings.length;
    const average = count ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / count) * 10) / 10 : 0;
    const distribution = [1, 2, 3, 4, 5].map((star) => ({ star, count: ratings.filter((r) => r.stars === star).length }));
    res.json({ average, count, distribution });
  } catch (err) { next(err); }
});

ratingRouter.get("/recent", async (_req, res, next) => {
  try {
    const recent = await Rating.find({ stars: { $gte: 1 } }).sort({ createdAt: -1 }).limit(12).populate("user", "name role");
    res.json({ ratings: recent });
  } catch (err) { next(err); }
});

ratingRouter.post("/", protect, async (req, res, next) => {
  try {
    const { stars, comment = "" } = req.body;
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: "Stars must be 1–5." });
    const rating = await Rating.findOneAndUpdate(
      { user: req.user._id },
      { stars, comment: comment.slice(0, 300) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ rating, message: "Rating saved. Thank you!" });
  } catch (err) { next(err); }
});

ratingRouter.get("/mine", protect, async (req, res, next) => {
  try {
    const rating = await Rating.findOne({ user: req.user._id });
    res.json({ rating: rating || null });
  } catch (err) { next(err); }
});
