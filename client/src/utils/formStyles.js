const VARIANTS = {
    default: {
        base: "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition",
        normal: "border-slate-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-500/10",
        error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
    },
    login: {
        base: "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition",
        normal: "border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
        error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
    },
    filter: {
        base: "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none transition",
        normal: "border-slate-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-500/10",
        error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
    },
};

export function fieldClass(hasError, variant = "default") {
    const styles = VARIANTS[variant] || VARIANTS.default;
    return `${styles.base} ${hasError ? styles.error : styles.normal}`;
}

export function selectClass(hasError, variant = "default") {
    return `${fieldClass(hasError, variant)} appearance-none cursor-pointer pr-10`;
}

export const labelClass = "mb-1.5 block text-sm font-medium text-slate-600";
export const errorTextClass = "mt-1 text-sm text-red-600";
export const selectChevronClass =
    "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";
