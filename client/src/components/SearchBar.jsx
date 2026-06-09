import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";

export default function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-100 bg-slate-50/80 py-2.5 pl-10 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-200 focus:bg-white focus:ring-2 focus:ring-teal-500/10"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                >
                    <HiOutlineXMark className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
