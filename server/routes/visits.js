import { Router } from "express";
import pool from "../db/pool.js";
import { timestampFields } from "../db/sqlFields.js";
import { internalServerError } from "../utils/errorHelpers.js";

const router = Router();

const visitSelect = `
  SELECT
    v.id,
    v.visit_date,
    v.notes,
    v.status,
    ${timestampFields("v")},
    c.id AS clinician_id,
    c.name AS clinician_name,
    c.specialty AS clinician_specialty,
    p.id AS patient_id,
    p.name AS patient_name,
    p.mrn AS patient_mrn
  FROM visits v
  JOIN clinicians c ON c.id = v.clinician_id
  JOIN patients p ON p.id = v.patient_id
`;

async function fetchVisit(id) {
  const { rows } = await pool.query(`${visitSelect} WHERE v.id = $1`, [id]);
  return rows[0];
}

function buildVisitListQuery(body = {}) {
  const { clinician_id, patient_id, status, visit_date, search } = body;
  const conditions = [];
  const params = [];

  if (clinician_id) {
    params.push(clinician_id);
    conditions.push(`v.clinician_id = $${params.length}`);
  }

  if (patient_id) {
    params.push(patient_id);
    conditions.push(`v.patient_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`v.status = $${params.length}`);
  }

  if (visit_date) {
    params.push(visit_date);
    conditions.push(`DATE(v.visit_date) = $${params.length}::date`);
  }

  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(`(
      c.name ILIKE ${placeholder} OR
      p.name ILIKE ${placeholder} OR
      COALESCE(v.notes, '') ILIKE ${placeholder} OR
      v.status ILIKE ${placeholder}
    )`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return { whereClause, params };
}

router.post("/list", async (req, res) => {
  const { whereClause, params } = buildVisitListQuery(req.body);

  try {
    const { rows } = await pool.query(
      `${visitSelect} ${whereClause} ORDER BY v.visit_date DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    internalServerError(res, err);
  }
});

router.post("/", async (req, res) => {
  const { clinician_id, patient_id, visit_date, notes } = req.body;

  if (!clinician_id || !patient_id) {
    return res
      .status(400)
      .json({ error: "clinician_id and patient_id are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO visits (clinician_id, patient_id, visit_date, notes, status)
       VALUES ($1, $2, COALESCE($3, NOW()), $4, 'scheduled')
       RETURNING id`,
      [clinician_id, patient_id, visit_date || null, notes?.trim() || null],
    );

    res.status(201).json(await fetchVisit(rows[0].id));
  } catch (err) {
    if (err.code === "23503") {
      return res
        .status(400)
        .json({ error: "Invalid clinician_id or patient_id" });
    }
    internalServerError(res, err);
  }
});

router.put("/:id", async (req, res) => {
  const { clinician_id, patient_id, visit_date, notes, status } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE visits SET
         clinician_id = COALESCE($1, clinician_id),
         patient_id = COALESCE($2, patient_id),
         visit_date = COALESCE($3, visit_date),
         notes = COALESCE($4, notes),
         status = COALESCE($5, status),
         updated_at = NOW()
       WHERE id = $6
       RETURNING id`,
      [
        clinician_id || null,
        patient_id || null,
        visit_date || null,
        notes !== undefined ? notes?.trim() || null : null,
        status || null,
        req.params.id,
      ],
    );

    if (!rows[0]) return res.status(404).json({ error: "Visit not found" });

    res.json(await fetchVisit(req.params.id));
  } catch (err) {
    if (err.code === "23503") {
      return res
        .status(400)
        .json({ error: "Invalid clinician_id or patient_id" });
    }
    internalServerError(res, err);
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE visits
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status != 'cancelled'
       RETURNING id`,
      [req.params.id],
    );

    if (!rows[0]) {
      const exists = await pool.query(
        "SELECT id, status FROM visits WHERE id = $1",
        [req.params.id],
      );
      if (!exists.rows[0])
        return res.status(404).json({ error: "Visit not found" });
      return res.status(400).json({ error: "Visit is already cancelled" });
    }

    res.json(await fetchVisit(req.params.id));
  } catch (err) {
    internalServerError(res, err);
  }
});

router.patch("/:id/complete", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE visits
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'scheduled'
       RETURNING id`,
      [req.params.id],
    );

    if (!rows[0]) {
      const exists = await pool.query(
        "SELECT id, status FROM visits WHERE id = $1",
        [req.params.id],
      );
      if (!exists.rows[0])
        return res.status(404).json({ error: "Visit not found" });
      return res
        .status(400)
        .json({ error: "Only scheduled visits can be marked completed" });
    }

    res.json(await fetchVisit(req.params.id));
  } catch (err) {
    internalServerError(res, err);
  }
});

router.patch("/:id/reschedule", async (req, res) => {
  const { visit_date } = req.body;

  if (!visit_date) {
    return res.status(400).json({ error: "visit_date is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE visits
       SET visit_date = $1, status = 'scheduled', updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [visit_date, req.params.id],
    );

    if (!rows[0]) return res.status(404).json({ error: "Visit not found" });

    res.json(await fetchVisit(req.params.id));
  } catch (err) {
    internalServerError(res, err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM visits WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "Visit not found" });
    res.json({ success: true });
  } catch (err) {
    internalServerError(res, err);
  }
});

export default router;
