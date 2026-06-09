import { HiOutlineInbox } from "react-icons/hi2";

export default function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-100 py-12 text-center">
            <HiOutlineInbox className="h-10 w-10 text-slate-200" />
            <p className="mt-2 text-sm text-slate-400">{message}</p>
        </div>
    );
}
