export function sortByName(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildOptimisticClinician(data) {
  return {
    id: `tmp-c-${Date.now()}`,
    name: data.name.trim(),
    specialty: data.specialty?.trim() || null,
    created_at: new Date().toISOString(),
    _optimistic: true,
  };
}

export function buildOptimisticPatient(data) {
  return {
    id: `tmp-p-${Date.now()}`,
    name: data.name.trim(),
    date_of_birth: data.date_of_birth || null,
    mrn: data.mrn?.trim() || null,
    created_at: new Date().toISOString(),
    _optimistic: true,
  };
}

export function buildOptimisticVisit(data, clinicians, patients) {
  const clinician = clinicians.find((c) => c.id === data.clinician_id);
  const patient = patients.find((p) => p.id === data.patient_id);
  const now = new Date().toISOString();

  return {
    id: `tmp-v-${Date.now()}`,
    clinician_id: data.clinician_id,
    patient_id: data.patient_id,
    visit_date: data.visit_date || now,
    notes: data.notes?.trim() || null,
    status: "scheduled",
    created_at: now,
    updated_at: now,
    clinician_name: clinician?.name || "Updating...",
    clinician_specialty: clinician?.specialty || null,
    patient_name: patient?.name || "Updating...",
    patient_mrn: patient?.mrn || null,
    _optimistic: true,
  };
}

export function patchVisitsForClinician(visits, clinicianId, data) {
  return visits.map((visit) =>
    visit.clinician_id === clinicianId
      ? {
          ...visit,
          clinician_name: data.name,
          clinician_specialty: data.specialty || null,
        }
      : visit,
  );
}

export function patchVisitsForPatient(visits, patientId, data) {
  return visits.map((visit) =>
    visit.patient_id === patientId
      ? {
          ...visit,
          patient_name: data.name,
          patient_mrn: data.mrn || null,
        }
      : visit,
  );
}

export function removeVisitsForClinician(visits, clinicianId) {
  return visits.filter((visit) => visit.clinician_id !== clinicianId);
}

export function removeVisitsForPatient(visits, patientId) {
  return visits.filter((visit) => visit.patient_id !== patientId);
}

export function replaceTempItem(list, tempId, item) {
  return list.map((entry) => (entry.id === tempId ? item : entry));
}

export function sortVisitsByDate(visits) {
  return [...visits].sort(
    (a, b) => new Date(b.visit_date) - new Date(a.visit_date),
  );
}
