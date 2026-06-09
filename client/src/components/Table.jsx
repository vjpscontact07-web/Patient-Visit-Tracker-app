const HEAD_ALIGN = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

const CELL_ALIGN = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

export function Table({
    children,
    minWidth = "880px",
    className = "",
    "aria-label": ariaLabel,
    stickyHeader = false,
    maxHeight = "70vh",
}) {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
                stickyHeader
                    ? "overflow-auto [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-slate-50 [&_th]:shadow-[0_1px_0_0_var(--color-slate-200)]"
                    : "overflow-x-auto"
            } ${className}`}
            style={stickyHeader ? { maxHeight } : undefined}
        >
            <table
                aria-label={ariaLabel}
                className="w-full border-separate border-spacing-0 text-sm"
                style={{ minWidth }}
            >
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }) {
    return <thead>{children}</thead>;
}

export function TableHeaderRow({ children }) {
    return (
        <tr className="border-b border-slate-200 bg-slate-50">{children}</tr>
    );
}

export function TableHeadCell({
    children,
    className = "",
    align = "left",
    width,
    scope = "col",
}) {
    return (
        <th
            scope={scope}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${HEAD_ALIGN[align]} ${className}`}
            style={width ? { width } : undefined}
        >
            {children}
        </th>
    );
}

export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
    return (
        <tr className={`transition-colors hover:bg-slate-50/80 ${className}`}>
            {children}
        </tr>
    );
}

export function TableCell({
    children,
    className = "",
    align = "left",
    title,
    colSpan,
}) {
    return (
        <td
            colSpan={colSpan}
            title={title}
            className={`border-b border-slate-100 px-4 py-3 align-middle ${CELL_ALIGN[align]} ${className}`}
        >
            {children}
        </td>
    );
}
