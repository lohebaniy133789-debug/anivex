import { Router } from "express";
import { getAuth } from "@clerk/express";
import { query } from "../lib/db";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const result = await query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows[0] || { user_id: userId });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { nickname, bio, avatar_url } = req.body;
  try {
    const result = await query(
      `INSERT INTO profiles (user_id, nickname, bio, avatar_url, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET nickname = EXCLUDED.nickname,
           bio = EXCLUDED.bio,
           avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
           updated_at = NOW()
       RETURNING *`,
      [userId, nickname || null, bio || null, avatar_url || null]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
