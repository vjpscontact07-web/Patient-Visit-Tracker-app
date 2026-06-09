import { Router } from "express";
import pool from "../db/pool.js";
import { timestampFields } from "../db/sqlFields.js";
import { internalServerError } from "../utils/errorHelpers.js";

const router = Router();

const patientSelect = `
  SELECT
    p.id,
    p.name,
    p.date_of_birth,
    p.mrn,
    ${timestampFields("p")}
  FROM patients p
`;

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`${patientSelect} ORDER BY p.name ASC`);
    res.json(rows);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.post("/", async (req, res) => {
  const { name, date_of_birth, mrn } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO patients (name, date_of_birth, mrn)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name.trim(), date_of_birth || null, mrn?.trim() || null],
    );
    const { rows: full } = await pool.query(
      `${patientSelect} WHERE p.id = $1`,
      [rows[0].id],
    );
    res.status(201).json(full[0]);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.put("/:id", async (req, res) => {
  const { name, date_of_birth, mrn } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE patients
       SET name = $1, date_of_birth = $2, mrn = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id`,
      [name.trim(), date_of_birth || null, mrn?.trim() || null, req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Patient not found" });

    const { rows: full } = await pool.query(
      `${patientSelect} WHERE p.id = $1`,
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
      "DELETE FROM patients WHERE id = $1",
      [req.params.id],
    );
    if (!rowCount) return res.status(404).json({ error: "Patient not found" });
    res.json({ success: true });
  } catch (err) {
    internalServerError(res, err);
  }
});

export default router;
