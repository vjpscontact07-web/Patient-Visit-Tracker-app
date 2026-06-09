import { todayDateKey } from "./dates.js";

export function buildVisitSearchParams(filters) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.clinician_id) params.set("clinician_id", filters.clinician_id);
    if (filters.patient_id) params.set("patient_id", filters.patient_id);
    if (filters.status) params.set("status", filters.status);
    if (filters.visit_date) params.set("date", filters.visit_date);
    return params;
}

export function parseVisitSearchParams(searchParams) {
    return {
        search: searchParams.get("search") || "",
        clinician_id: searchParams.get("clinician_id") || "",
        patient_id: searchParams.get("patient_id") || "",
        status: searchParams.get("status") || "",
        visit_date: searchParams.get("date") || todayDateKey(),
    };
}

export function visitsPath(filters = {}) {
    const params = buildVisitSearchParams(filters);
    const query = params.toString();
    return query ? `/visits?${query}` : "/visits";
}

export function clinicianVisitsPath(clinicianId) {
    return visitsPath({
        search: "",
        clinician_id: String(clinicianId),
        patient_id: "",
        status: "",
        visit_date: todayDateKey(),
    });
}

export function patientVisitsPath(patientId) {
    return visitsPath({
        search: "",
        clinician_id: "",
        patient_id: String(patientId),
        status: "",
        visit_date: todayDateKey(),
    });
}
