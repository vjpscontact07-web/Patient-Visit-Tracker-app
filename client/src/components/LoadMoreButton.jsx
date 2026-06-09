import { HiOutlineChevronDown } from "react-icons/hi2";

export default function LoadMoreButton({ remaining, onClick }) {
    return (
        <div className="mt-6 flex justify-center">
            <button
                type="button"
                onClick={onClick}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-teal-100 hover:bg-teal-50/50 hover:text-teal-700"
            >
                <HiOutlineChevronDown className="h-4 w-4" />
                Load more ({remaining})
            </button>
        </div>
    );
}
