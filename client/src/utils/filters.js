export function filterClinician(clinician, query) {
  if (!query) return true;
  return (
    clinician.name.toLowerCase().includes(query) ||
    (clinician.specialty || "").toLowerCase().includes(query)
  );
}

export function filterPatient(patient, query) {
  if (!query) return true;
  return (
    patient.name.toLowerCase().includes(query) ||
    (patient.mrn || "").toLowerCase().includes(query)
  );
}
