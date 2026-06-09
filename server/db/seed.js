import bcrypt from "bcryptjs";

export async function seedUser(client) {
  const passwordHash = await bcrypt.hash("woundtech123", 10);
  await client.query(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)",
    ["admin@woundtech.net", passwordHash, "Admin User"],
  );
}

export async function seedDemoData(client) {
  await client.query(
    `INSERT INTO clinicians (name, specialty) VALUES
      ('Dr. Sarah Chen', 'Wound Care Specialist'),
      ('James Rodriguez, NP', 'Advanced Practice Provider'),
      ('Dr. Michael Patel', 'Podiatry'),
      ('Dr. Emily Watson', 'Dermatology'),
      ('Dr. Rajesh Kumar', 'Internal Medicine'),
      ('Lisa Nguyen, PA-C', 'Wound Care'),
      ('Dr. Carlos Mendez', 'Vascular Surgery'),
      ('Angela Foster, NP', 'Geriatric Care'),
      ('Dr. Hannah Brooks', 'Infectious Disease'),
      ('Marcus Lee, DPM', 'Podiatry'),
      ('Dr. Priya Sharma', 'Palliative Care'),
      ('Tom Bradley, RN', 'Clinical Nursing'),
      ('Dr. Olivia Grant', 'Family Medicine'),
      ('Nina Kapoor, NP', 'Home Health'),
      ('Dr. Daniel Ortiz', 'Orthopedics')`,
  );

  await client.query(
    `INSERT INTO patients (name, date_of_birth, mrn) VALUES
      ('Eleanor Martinez', '1952-03-14', 'MRN-10042'),
      ('Robert Thompson', '1948-11-02', 'MRN-10087'),
      ('Diana Brooks', '1961-07-28', 'MRN-10115'),
      ('William Hayes', '1945-01-20', 'MRN-10120'),
      ('Margaret Sullivan', '1950-08-09', 'MRN-10121'),
      ('George Kim', '1939-12-03', 'MRN-10122'),
      ('Helen Carter', '1955-04-17', 'MRN-10123'),
      ('Frank Delgado', '1943-06-25', 'MRN-10124'),
      ('Betty Nguyen', '1958-10-11', 'MRN-10125'),
      ('Harold Simmons', '1941-02-28', 'MRN-10126'),
      ('Ruth Patterson', '1949-09-30', 'MRN-10127'),
      ('Arthur Coleman', '1936-11-15', 'MRN-10128'),
      ('Dorothy Evans', '1953-07-07', 'MRN-10129'),
      ('Raymond Price', '1947-03-22', 'MRN-10130'),
      ('Virginia Scott', '1956-12-18', 'MRN-10131'),
      ('Albert Rivera', '1940-05-05', 'MRN-10132'),
      ('Carol Mitchell', '1951-08-26', 'MRN-10133'),
      ('Henry Adams', '1938-01-14', 'MRN-10134')`,
  );

  await client.query(
    `INSERT INTO visits (clinician_id, patient_id, visit_date, notes, status)
     SELECT c.id, p.id, v.visit_date, v.notes, v.status
     FROM (VALUES
       ('Dr. Sarah Chen', 'Eleanor Martinez', '2026-06-01 10:30:00+00'::TIMESTAMPTZ, 'Initial wound assessment. Stage 2 pressure ulcer on left heel.', 'scheduled'),
       ('James Rodriguez, NP', 'Robert Thompson', '2026-06-03 14:00:00+00'::TIMESTAMPTZ, 'Follow-up visit. Wound showing signs of granulation.', 'completed'),
       ('Dr. Michael Patel', 'Diana Brooks', '2026-06-05 09:15:00+00'::TIMESTAMPTZ, 'Debridement performed. Dressing changed.', 'cancelled')
     ) AS v(clinician_name, patient_name, visit_date, notes, status)
     JOIN clinicians c ON c.name = v.clinician_name
     JOIN patients p ON p.name = v.patient_name`,
  );
}
