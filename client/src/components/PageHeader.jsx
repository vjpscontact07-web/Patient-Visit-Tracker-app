import { HiOutlinePlus } from "react-icons/hi2";

export default function PageHeader({ title, count, showing, onAdd, addLabel }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {showing} of {count} records
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
      >
        <HiOutlinePlus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
