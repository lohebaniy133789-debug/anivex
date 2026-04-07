import { Router } from "express";
import { getAuth } from "@clerk/express";
import { query } from "../lib/db";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { status } = req.query;
  try {
    let sql = "SELECT * FROM anime_lists WHERE user_id = $1";
    const params: any[] = [userId];
    if (status) { sql += " AND status = $2"; params.push(status); }
    sql += " ORDER BY updated_at DESC";
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/check/:animeId", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const result = await query(
      "SELECT * FROM anime_lists WHERE user_id = $1 AND anime_id = $2",
      [userId, parseInt(req.params.animeId)]
    );
    res.json(result.rows[0] || null);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { anime_id, status, score, episodes_watched, notes, anime_data } = req.body;
  if (!anime_id || !status) return res.status(400).json({ error: "anime_id and status required" });
  try {
    const result = await query(
      `INSERT INTO anime_lists (user_id, anime_id, status, score, episodes_watched, notes, anime_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id, anime_id) DO UPDATE
       SET status = EXCLUDED.status,
           score = COALESCE(EXCLUDED.score, anime_lists.score),
           episodes_watched = COALESCE(EXCLUDED.episodes_watched, anime_lists.episodes_watched),
           notes = COALESCE(EXCLUDED.notes, anime_lists.notes),
           anime_data = COALESCE(EXCLUDED.anime_data, anime_lists.anime_data),
           updated_at = NOW()
       RETURNING *`,
      [userId, anime_id, status, score || null, episodes_watched || 0, notes || null,
       anime_data ? JSON.stringify(anime_data) : null]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:animeId", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    await query(
      "DELETE FROM anime_lists WHERE user_id = $1 AND anime_id = $2",
      [userId, parseInt(req.params.animeId)]
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
