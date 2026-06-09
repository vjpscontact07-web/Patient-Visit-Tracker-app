export default function FormActions({ onCancel, submitLabel, submitting }) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-slate-100 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
                {submitting ? "Saving..." : submitLabel}
            </button>
        </div>
    );
}
