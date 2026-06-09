import {
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineTrash,
    HiOutlineXCircle,
} from "react-icons/hi2";

const INTENTS = {
    danger: {
        Icon: HiOutlineTrash,
        iconWrap: "bg-red-50 ring-red-100",
        iconColor: "text-red-600",
        confirmClass:
            "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/30",
    },
    warning: {
        Icon: HiOutlineXCircle,
        iconWrap: "bg-amber-50 ring-amber-100",
        iconColor: "text-amber-600",
        confirmClass:
            "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500/30",
    },
    success: {
        Icon: HiOutlineCheckCircle,
        iconWrap: "bg-emerald-50 ring-emerald-100",
        iconColor: "text-emerald-600",
        confirmClass:
            "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30",
    },
    default: {
        Icon: HiOutlineExclamationTriangle,
        iconWrap: "bg-teal-50 ring-teal-100",
        iconColor: "text-teal-600",
        confirmClass:
            "bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500/30",
    },
};

export default function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    intent = "danger",
    onConfirm,
    onCancel,
}) {
    const { Icon, iconWrap, iconColor, confirmClass } =
        INTENTS[intent] || INTENTS.default;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onCancel}
                aria-label="Close"
            />
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                role="dialog"
                aria-modal="true"
            >
                <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ring-1 ${iconWrap}`}
                >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {message}
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
