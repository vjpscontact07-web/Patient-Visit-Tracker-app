export function toLocalDateKey(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayDateKey() {
    return toLocalDateKey(new Date().toISOString());
}

export function formatVisitParts(dateString) {
    if (!dateString) return { date: "—", time: "" };
    const d = new Date(dateString);
    return {
        date: d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        time: d.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
        }),
    };
}

export function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export function formatDob(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
        dateStyle: "medium",
    });
}

function pad(n) {
    return String(n).padStart(2, "0");
}

export function nowDatetimeLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDatetimeLocal(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
