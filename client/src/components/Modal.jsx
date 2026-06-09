import { HiOutlineXMark } from "react-icons/hi2";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
