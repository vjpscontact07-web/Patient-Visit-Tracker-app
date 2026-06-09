const COLORS = [
    "bg-teal-500/90",
    "bg-emerald-500/90",
    "bg-cyan-500/90",
    "bg-sky-500/90",
    "bg-indigo-500/90",
    "bg-violet-500/90",
    "bg-rose-400/90",
    "bg-amber-500/90",
];

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getColorClass(name) {
    const index = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLORS[index % COLORS.length];
}

export default function Avatar({ name }) {
    return (
        <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white ${getColorClass(name)}`}
            aria-hidden="true"
        >
            {getInitials(name)}
        </div>
    );
}
