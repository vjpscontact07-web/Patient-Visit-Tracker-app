import { Router } from "express";
import pool from "../db/pool.js";
import { timestampFields } from "../db/sqlFields.js";
import { internalServerError } from "../utils/errorHelpers.js";

const router = Router();

const clinicianSelect = `
  SELECT
    c.id,
    c.name,
    c.specialty,
    ${timestampFields("c")}
  FROM clinicians c
`;

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`${clinicianSelect} ORDER BY c.name ASC`);
    res.json(rows);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.post("/", async (req, res) => {
  const { name, specialty } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO clinicians (name, specialty)
       VALUES ($1, $2)
       RETURNING id`,
      [name.trim(), specialty?.trim() || null],
    );
    const { rows: full } = await pool.query(
      `${clinicianSelect} WHERE c.id = $1`,
      [rows[0].id],
    );
    res.status(201).json(full[0]);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.put("/:id", async (req, res) => {
  const { name, specialty } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE clinicians
       SET name = $1, specialty = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id`,
      [name.trim(), specialty?.trim() || null, req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Clinician not found" });

    const { rows: full } = await pool.query(
      `${clinicianSelect} WHERE c.id = $1`,
      [req.params.id],
    );
    res.json(full[0]);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM clinicians WHERE id = $1",
      [req.params.id],
    );
    if (!rowCount)
      return res.status(404).json({ error: "Clinician not found" });
    res.json({ success: true });
  } catch (err) {
    internalServerError(res, err);
  }
});

export default router;
