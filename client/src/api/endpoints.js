export const ENDPOINTS = {
    auth: {
        login: "/auth/login",
        register: "/auth/register",
        me: "/auth/me",
    },
    clinicians: {
        base: "/clinicians",
        byId: (id) => `/clinicians/${id}`,
    },
    patients: {
        base: "/patients",
        byId: (id) => `/patients/${id}`,
    },
    visits: {
        list: "/visits/list",
        base: "/visits",
        byId: (id) => `/visits/${id}`,
        cancel: (id) => `/visits/${id}/cancel`,
        complete: (id) => `/visits/${id}/complete`,
        reschedule: (id) => `/visits/${id}/reschedule`,
    },
};
