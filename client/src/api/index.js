import { http } from "./axiosClient.js";
import { getAuthToken, setAuthToken } from "./authToken.js";
import { ENDPOINTS } from "./endpoints.js";

export { getAuthToken, setAuthToken };

function visitListPayload(filters = {}) {
    return {
        search: filters.search || "",
        clinician_id: filters.clinician_id || "",
        patient_id: filters.patient_id || "",
        status: filters.status || "",
        visit_date: filters.visit_date || "",
    };
}

export const api = {
    auth: {
        login: (body) => http.post(ENDPOINTS.auth.login, body),
        register: (body) => http.post(ENDPOINTS.auth.register, body),
        me: () => http.get(ENDPOINTS.auth.me),
    },
    clinicians: {
        list: () => http.get(ENDPOINTS.clinicians.base),
        create: (body) => http.post(ENDPOINTS.clinicians.base, body),
        update: (id, body) => http.put(ENDPOINTS.clinicians.byId(id), body),
        delete: (id) => http.delete(ENDPOINTS.clinicians.byId(id)),
    },
    patients: {
        list: () => http.get(ENDPOINTS.patients.base),
        create: (body) => http.post(ENDPOINTS.patients.base, body),
        update: (id, body) => http.put(ENDPOINTS.patients.byId(id), body),
        delete: (id) => http.delete(ENDPOINTS.patients.byId(id)),
    },
    visits: {
        list: (filters) =>
            http.post(ENDPOINTS.visits.list, visitListPayload(filters)),
        create: (body) => http.post(ENDPOINTS.visits.base, body),
        update: (id, body) => http.put(ENDPOINTS.visits.byId(id), body),
        cancel: (id) => http.patch(ENDPOINTS.visits.cancel(id)),
        complete: (id) => http.patch(ENDPOINTS.visits.complete(id)),
        reschedule: (id, body) =>
            http.patch(ENDPOINTS.visits.reschedule(id), body),
        delete: (id) => http.delete(ENDPOINTS.visits.byId(id)),
    },
};
